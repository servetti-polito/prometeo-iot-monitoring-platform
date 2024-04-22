package api

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/infra/log"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/ngalert/api/hcl"
	"github.com/grafana/grafana/pkg/services/ngalert/api/tooling/definitions"
	alerting_models "github.com/grafana/grafana/pkg/services/ngalert/models"
	"github.com/grafana/grafana/pkg/services/ngalert/provisioning"
	"github.com/grafana/grafana/pkg/services/ngalert/store"
	"github.com/grafana/grafana/pkg/services/user"
	"github.com/grafana/grafana/pkg/util"
)

const disableProvenanceHeaderName = "X-Disable-Provenance"

type ProvisioningSrv struct {
	log                 log.Logger
	policies            NotificationPolicyService
	contactPointService ContactPointService
	templates           TemplateService
	muteTimings         MuteTimingService
	alertRules          AlertRuleService
}

type ContactPointService interface {
	GetContactPoints(ctx context.Context, q provisioning.ContactPointQuery, user *user.SignedInUser) ([]definitions.EmbeddedContactPoint, error)
	CreateContactPoint(ctx context.Context, orgID int64, contactPoint definitions.EmbeddedContactPoint, p alerting_models.Provenance) (definitions.EmbeddedContactPoint, error)
	UpdateContactPoint(ctx context.Context, orgID int64, contactPoint definitions.EmbeddedContactPoint, p alerting_models.Provenance) error
	DeleteContactPoint(ctx context.Context, orgID int64, uid string) error
}

type TemplateService interface {
	GetTemplates(ctx context.Context, orgID int64) (map[string]string, error)
	SetTemplate(ctx context.Context, orgID int64, tmpl definitions.NotificationTemplate) (definitions.NotificationTemplate, error)
	DeleteTemplate(ctx context.Context, orgID int64, name string) error
}

type NotificationPolicyService interface {
	GetPolicyTree(ctx context.Context, orgID int64) (definitions.Route, error)
	UpdatePolicyTree(ctx context.Context, orgID int64, tree definitions.Route, p alerting_models.Provenance) error
	ResetPolicyTree(ctx context.Context, orgID int64) (definitions.Route, error)
}

type MuteTimingService interface {
	GetMuteTimings(ctx context.Context, orgID int64) ([]definitions.MuteTimeInterval, error)
	CreateMuteTiming(ctx context.Context, mt definitions.MuteTimeInterval, orgID int64) (*definitions.MuteTimeInterval, error)
	UpdateMuteTiming(ctx context.Context, mt definitions.MuteTimeInterval, orgID int64) (*definitions.MuteTimeInterval, error)
	DeleteMuteTiming(ctx context.Context, name string, orgID int64) error
}

type AlertRuleService interface {
	GetAlertRules(ctx context.Context, orgID int64) ([]*alerting_models.AlertRule, error)
	GetAlertRule(ctx context.Context, orgID int64, ruleUID string) (alerting_models.AlertRule, alerting_models.Provenance, error)
	CreateAlertRule(ctx context.Context, rule alerting_models.AlertRule, provenance alerting_models.Provenance, userID int64) (alerting_models.AlertRule, error)
	UpdateAlertRule(ctx context.Context, rule alerting_models.AlertRule, provenance alerting_models.Provenance) (alerting_models.AlertRule, error)
	DeleteAlertRule(ctx context.Context, orgID int64, ruleUID string, provenance alerting_models.Provenance) error
	GetRuleGroup(ctx context.Context, orgID int64, folder, group string) (alerting_models.AlertRuleGroup, error)
	ReplaceRuleGroup(ctx context.Context, orgID int64, group alerting_models.AlertRuleGroup, userID int64, provenance alerting_models.Provenance) error
	GetAlertRuleWithFolderTitle(ctx context.Context, orgID int64, ruleUID string) (provisioning.AlertRuleWithFolderTitle, error)
	GetAlertRuleGroupWithFolderTitle(ctx context.Context, orgID int64, folder, group string) (alerting_models.AlertRuleGroupWithFolderTitle, error)
	GetAlertGroupsWithFolderTitle(ctx context.Context, orgID int64, folderUIDs []string) ([]alerting_models.AlertRuleGroupWithFolderTitle, error)
}

func (srv *ProvisioningSrv) RouteGetPolicyTree(c *contextmodel.ReqContext) response.Response {
	policies, err := srv.policies.GetPolicyTree(c.Req.Context(), c.OrgID)
	if errors.Is(err, store.ErrNoAlertmanagerConfiguration) {
		return ErrResp(http.StatusNotFound, err, "")
	}
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}

	return response.JSON(http.StatusOK, policies)
}

func (srv *ProvisioningSrv) RouteGetPolicyTreeExport(c *contextmodel.ReqContext) response.Response {
	policies, err := srv.policies.GetPolicyTree(c.Req.Context(), c.OrgID)
	if err != nil {
		if errors.Is(err, store.ErrNoAlertmanagerConfiguration) {
			return ErrResp(http.StatusNotFound, err, "")
		}
		return ErrResp(http.StatusInternalServerError, err, "")
	}

	e, err := AlertingFileExportFromRoute(c.OrgID, policies)
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "failed to create alerting file export")
	}

	return exportResponse(c, e)
}

func (srv *ProvisioningSrv) RoutePutPolicyTree(c *contextmodel.ReqContext, tree definitions.Route) response.Response {
	provenance := determineProvenance(c)
	err := srv.policies.UpdatePolicyTree(c.Req.Context(), c.OrgID, tree, alerting_models.Provenance(provenance))
	if errors.Is(err, store.ErrNoAlertmanagerConfiguration) {
		return ErrResp(http.StatusNotFound, err, "")
	}
	if errors.Is(err, provisioning.ErrValidation) {
		return ErrResp(http.StatusBadRequest, err, "")
	}
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}

	return response.JSON(http.StatusAccepted, util.DynMap{"message": "policies updated"})
}

func (srv *ProvisioningSrv) RouteResetPolicyTree(c *contextmodel.ReqContext) response.Response {
	tree, err := srv.policies.ResetPolicyTree(c.Req.Context(), c.OrgID)
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusAccepted, tree)
}

func (srv *ProvisioningSrv) RouteGetContactPoints(c *contextmodel.ReqContext) response.Response {
	q := provisioning.ContactPointQuery{
		Name:  c.Query("name"),
		OrgID: c.OrgID,
	}
	cps, err := srv.contactPointService.GetContactPoints(c.Req.Context(), q, nil)
	if err != nil {
		if errors.Is(err, provisioning.ErrPermissionDenied) {
			return ErrResp(http.StatusForbidden, err, "")
		}
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusOK, cps)
}

func (srv *ProvisioningSrv) RouteGetContactPointsExport(c *contextmodel.ReqContext) response.Response {
	q := provisioning.ContactPointQuery{
		Name:    c.Query("name"),
		OrgID:   c.OrgID,
		Decrypt: c.QueryBoolWithDefault("decrypt", false),
	}
	cps, err := srv.contactPointService.GetContactPoints(c.Req.Context(), q, c.SignedInUser)
	if err != nil {
		if errors.Is(err, provisioning.ErrPermissionDenied) {
			return ErrResp(http.StatusForbidden, err, "")
		}
		return ErrResp(http.StatusInternalServerError, err, "")
	}

	e, err := AlertingFileExportFromEmbeddedContactPoints(c.OrgID, cps)
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "failed to create alerting file export")
	}

	return exportResponse(c, e)
}

func (srv *ProvisioningSrv) RoutePostContactPoint(c *contextmodel.ReqContext, cp definitions.EmbeddedContactPoint) response.Response {
	provenance := determineProvenance(c)
	contactPoint, err := srv.contactPointService.CreateContactPoint(c.Req.Context(), c.OrgID, cp, alerting_models.Provenance(provenance))
	if errors.Is(err, provisioning.ErrValidation) {
		return ErrResp(http.StatusBadRequest, err, "")
	}
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusAccepted, contactPoint)
}

func (srv *ProvisioningSrv) RoutePutContactPoint(c *contextmodel.ReqContext, cp definitions.EmbeddedContactPoint, UID string) response.Response {
	cp.UID = UID
	provenance := determineProvenance(c)
	err := srv.contactPointService.UpdateContactPoint(c.Req.Context(), c.OrgID, cp, alerting_models.Provenance(provenance))
	if errors.Is(err, provisioning.ErrValidation) {
		return ErrResp(http.StatusBadRequest, err, "")
	}
	if errors.Is(err, provisioning.ErrNotFound) {
		return ErrResp(http.StatusNotFound, err, "")
	}
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusAccepted, util.DynMap{"message": "contactpoint updated"})
}

func (srv *ProvisioningSrv) RouteDeleteContactPoint(c *contextmodel.ReqContext, UID string) response.Response {
	err := srv.contactPointService.DeleteContactPoint(c.Req.Context(), c.OrgID, UID)
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusAccepted, util.DynMap{"message": "contactpoint deleted"})
}

func (srv *ProvisioningSrv) RouteGetTemplates(c *contextmodel.ReqContext) response.Response {
	templates, err := srv.templates.GetTemplates(c.Req.Context(), c.OrgID)
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	result := make([]definitions.NotificationTemplate, 0, len(templates))
	for k, v := range templates {
		result = append(result, definitions.NotificationTemplate{Name: k, Template: v})
	}
	return response.JSON(http.StatusOK, result)
}

func (srv *ProvisioningSrv) RouteGetTemplate(c *contextmodel.ReqContext, name string) response.Response {
	templates, err := srv.templates.GetTemplates(c.Req.Context(), c.OrgID)
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	if tmpl, ok := templates[name]; ok {
		return response.JSON(http.StatusOK, definitions.NotificationTemplate{Name: name, Template: tmpl})
	}
	return response.Empty(http.StatusNotFound)
}

func (srv *ProvisioningSrv) RoutePutTemplate(c *contextmodel.ReqContext, body definitions.NotificationTemplateContent, name string) response.Response {
	tmpl := definitions.NotificationTemplate{
		Name:       name,
		Template:   body.Template,
		Provenance: determineProvenance(c),
	}
	modified, err := srv.templates.SetTemplate(c.Req.Context(), c.OrgID, tmpl)
	if err != nil {
		if errors.Is(err, provisioning.ErrValidation) {
			return ErrResp(http.StatusBadRequest, err, "")
		}
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusAccepted, modified)
}

func (srv *ProvisioningSrv) RouteDeleteTemplate(c *contextmodel.ReqContext, name string) response.Response {
	err := srv.templates.DeleteTemplate(c.Req.Context(), c.OrgID, name)
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusNoContent, nil)
}

func (srv *ProvisioningSrv) RouteGetMuteTiming(c *contextmodel.ReqContext, name string) response.Response {
	timings, err := srv.muteTimings.GetMuteTimings(c.Req.Context(), c.OrgID)
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	for _, timing := range timings {
		if name == timing.Name {
			return response.JSON(http.StatusOK, timing)
		}
	}
	return response.Empty(http.StatusNotFound)
}

func (srv *ProvisioningSrv) RouteGetMuteTimings(c *contextmodel.ReqContext) response.Response {
	timings, err := srv.muteTimings.GetMuteTimings(c.Req.Context(), c.OrgID)
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusOK, timings)
}

func (srv *ProvisioningSrv) RoutePostMuteTiming(c *contextmodel.ReqContext, mt definitions.MuteTimeInterval) response.Response {
	mt.Provenance = determineProvenance(c)
	created, err := srv.muteTimings.CreateMuteTiming(c.Req.Context(), mt, c.OrgID)
	if err != nil {
		if errors.Is(err, provisioning.ErrValidation) {
			return ErrResp(http.StatusBadRequest, err, "")
		}
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusCreated, created)
}

func (srv *ProvisioningSrv) RoutePutMuteTiming(c *contextmodel.ReqContext, mt definitions.MuteTimeInterval, name string) response.Response {
	mt.Name = name
	mt.Provenance = determineProvenance(c)
	updated, err := srv.muteTimings.UpdateMuteTiming(c.Req.Context(), mt, c.OrgID)
	if err != nil {
		if errors.Is(err, provisioning.ErrValidation) {
			return ErrResp(http.StatusBadRequest, err, "")
		}
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	if updated == nil {
		return response.Empty(http.StatusNotFound)
	}
	return response.JSON(http.StatusAccepted, updated)
}

func (srv *ProvisioningSrv) RouteDeleteMuteTiming(c *contextmodel.ReqContext, name string) response.Response {
	err := srv.muteTimings.DeleteMuteTiming(c.Req.Context(), name, c.OrgID)
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusNoContent, nil)
}

func (srv *ProvisioningSrv) RouteGetAlertRules(c *contextmodel.ReqContext) response.Response {
	rules, err := srv.alertRules.GetAlertRules(c.Req.Context(), c.OrgID)
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusOK, ProvisionedAlertRuleFromAlertRules(rules))
}

func (srv *ProvisioningSrv) RouteRouteGetAlertRule(c *contextmodel.ReqContext, UID string) response.Response {
	rule, provenace, err := srv.alertRules.GetAlertRule(c.Req.Context(), c.OrgID, UID)
	if err != nil {
		if errors.Is(err, alerting_models.ErrAlertRuleNotFound) {
			return response.Empty(http.StatusNotFound)
		}
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusOK, ProvisionedAlertRuleFromAlertRule(rule, provenace))
}

func (srv *ProvisioningSrv) RoutePostAlertRule(c *contextmodel.ReqContext, ar definitions.ProvisionedAlertRule) response.Response {
	upstreamModel, err := AlertRuleFromProvisionedAlertRule(ar)
	upstreamModel.OrgID = c.OrgID
	if err != nil {
		return ErrResp(http.StatusBadRequest, err, "")
	}
	provenance := determineProvenance(c)
	createdAlertRule, err := srv.alertRules.CreateAlertRule(c.Req.Context(), upstreamModel, alerting_models.Provenance(provenance), c.UserID)
	if errors.Is(err, alerting_models.ErrAlertRuleFailedValidation) {
		return ErrResp(http.StatusBadRequest, err, "")
	}
	if err != nil {
		if errors.Is(err, store.ErrOptimisticLock) {
			return ErrResp(http.StatusConflict, err, "")
		}
		if errors.Is(err, alerting_models.ErrQuotaReached) {
			return ErrResp(http.StatusForbidden, err, "")
		}
		return ErrResp(http.StatusInternalServerError, err, "")
	}

	resp := ProvisionedAlertRuleFromAlertRule(createdAlertRule, alerting_models.Provenance(provenance))
	return response.JSON(http.StatusCreated, resp)
}

func (srv *ProvisioningSrv) RoutePutAlertRule(c *contextmodel.ReqContext, ar definitions.ProvisionedAlertRule, UID string) response.Response {
	updated, err := AlertRuleFromProvisionedAlertRule(ar)
	if err != nil {
		ErrResp(http.StatusBadRequest, err, "")
	}
	updated.OrgID = c.OrgID
	updated.UID = UID
	provenance := determineProvenance(c)
	updatedAlertRule, err := srv.alertRules.UpdateAlertRule(c.Req.Context(), updated, alerting_models.Provenance(provenance))
	if errors.Is(err, alerting_models.ErrAlertRuleNotFound) {
		return response.Empty(http.StatusNotFound)
	}
	if errors.Is(err, alerting_models.ErrAlertRuleFailedValidation) {
		return ErrResp(http.StatusBadRequest, err, "")
	}
	if err != nil {
		if errors.Is(err, store.ErrOptimisticLock) {
			return ErrResp(http.StatusConflict, err, "")
		}
		return ErrResp(http.StatusInternalServerError, err, "")
	}

	resp := ProvisionedAlertRuleFromAlertRule(updatedAlertRule, alerting_models.Provenance(provenance))
	return response.JSON(http.StatusOK, resp)
}

func (srv *ProvisioningSrv) RouteDeleteAlertRule(c *contextmodel.ReqContext, UID string) response.Response {
	provenance := determineProvenance(c)
	err := srv.alertRules.DeleteAlertRule(c.Req.Context(), c.OrgID, UID, alerting_models.Provenance(provenance))
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusNoContent, "")
}

func (srv *ProvisioningSrv) RouteGetAlertRuleGroup(c *contextmodel.ReqContext, folder string, group string) response.Response {
	g, err := srv.alertRules.GetRuleGroup(c.Req.Context(), c.OrgID, folder, group)
	if err != nil {
		if errors.Is(err, store.ErrAlertRuleGroupNotFound) {
			return ErrResp(http.StatusNotFound, err, "")
		}
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusOK, ApiAlertRuleGroupFromAlertRuleGroup(g))
}

// RouteGetAlertRulesExport retrieves all alert rules in a format compatible with file provisioning.
func (srv *ProvisioningSrv) RouteGetAlertRulesExport(c *contextmodel.ReqContext) response.Response {
	folderUIDs := c.QueryStrings("folderUid")
	group := c.Query("group")
	uid := c.Query("ruleUid")
	if uid != "" {
		if group != "" || len(folderUIDs) > 0 {
			return ErrResp(http.StatusBadRequest, errors.New("group and folder should not be specified when a single rule is requested"), "")
		}
		return srv.RouteGetAlertRuleExport(c, uid)
	}
	if group != "" {
		if len(folderUIDs) != 1 || folderUIDs[0] == "" {
			return ErrResp(http.StatusBadRequest,
				fmt.Errorf("group name must be specified together with a single folder_uid parameter. Got %d", len(folderUIDs)),
				"",
			)
		}
		return srv.RouteGetAlertRuleGroupExport(c, folderUIDs[0], group)
	}

	groupsWithTitle, err := srv.alertRules.GetAlertGroupsWithFolderTitle(c.Req.Context(), c.OrgID, folderUIDs)
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "failed to get alert rules")
	}
	if len(groupsWithTitle) == 0 {
		return response.Empty(http.StatusNotFound)
	}

	e, err := AlertingFileExportFromAlertRuleGroupWithFolderTitle(groupsWithTitle)
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "failed to create alerting file export")
	}

	return exportResponse(c, e)
}

// RouteGetAlertRuleGroupExport retrieves the given alert rule group in a format compatible with file provisioning.
func (srv *ProvisioningSrv) RouteGetAlertRuleGroupExport(c *contextmodel.ReqContext, folder string, group string) response.Response {
	g, err := srv.alertRules.GetAlertRuleGroupWithFolderTitle(c.Req.Context(), c.OrgID, folder, group)
	if err != nil {
		if errors.Is(err, store.ErrAlertRuleGroupNotFound) {
			return ErrResp(http.StatusNotFound, err, "")
		}
		return ErrResp(http.StatusInternalServerError, err, "failed to get alert rule group")
	}

	e, err := AlertingFileExportFromAlertRuleGroupWithFolderTitle([]alerting_models.AlertRuleGroupWithFolderTitle{g})
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "failed to create alerting file export")
	}

	return exportResponse(c, e)
}

// RouteGetAlertRuleExport retrieves the given alert rule in a format compatible with file provisioning.
func (srv *ProvisioningSrv) RouteGetAlertRuleExport(c *contextmodel.ReqContext, UID string) response.Response {
	rule, err := srv.alertRules.GetAlertRuleWithFolderTitle(c.Req.Context(), c.OrgID, UID)
	if err != nil {
		if errors.Is(err, alerting_models.ErrAlertRuleNotFound) {
			return ErrResp(http.StatusNotFound, err, "")
		}
		return ErrResp(http.StatusInternalServerError, err, "")
	}

	e, err := AlertingFileExportFromAlertRuleGroupWithFolderTitle([]alerting_models.AlertRuleGroupWithFolderTitle{{
		AlertRuleGroup: &alerting_models.AlertRuleGroup{
			Title:     rule.AlertRule.RuleGroup,
			FolderUID: rule.AlertRule.NamespaceUID,
			Interval:  rule.AlertRule.IntervalSeconds,
			Rules:     []alerting_models.AlertRule{rule.AlertRule},
		},
		OrgID:       c.OrgID,
		FolderTitle: rule.FolderTitle,
	}})
	if err != nil {
		return ErrResp(http.StatusInternalServerError, err, "failed to create alerting file export")
	}

	return exportResponse(c, e)
}

func (srv *ProvisioningSrv) RoutePutAlertRuleGroup(c *contextmodel.ReqContext, ag definitions.AlertRuleGroup, folderUID string, group string) response.Response {
	ag.FolderUID = folderUID
	ag.Title = group
	groupModel, err := AlertRuleGroupFromApiAlertRuleGroup(ag)
	if err != nil {
		ErrResp(http.StatusBadRequest, err, "")
	}
	provenance := determineProvenance(c)
	err = srv.alertRules.ReplaceRuleGroup(c.Req.Context(), c.OrgID, groupModel, c.UserID, alerting_models.Provenance(provenance))
	if errors.Is(err, alerting_models.ErrAlertRuleFailedValidation) {
		return ErrResp(http.StatusBadRequest, err, "")
	}
	if err != nil {
		if errors.Is(err, store.ErrOptimisticLock) {
			return ErrResp(http.StatusConflict, err, "")
		}
		return ErrResp(http.StatusInternalServerError, err, "")
	}
	return response.JSON(http.StatusOK, ag)
}

func determineProvenance(ctx *contextmodel.ReqContext) definitions.Provenance {
	if _, disabled := ctx.Req.Header[disableProvenanceHeaderName]; disabled {
		return definitions.Provenance(alerting_models.ProvenanceNone)
	}
	return definitions.Provenance(alerting_models.ProvenanceAPI)
}

func extractExportRequest(c *contextmodel.ReqContext) definitions.ExportQueryParams {
	var format = "yaml"

	acceptHeader := c.Req.Header.Get("Accept")
	if strings.Contains(acceptHeader, "yaml") {
		format = "yaml"
	}

	if strings.Contains(acceptHeader, "json") {
		format = "json"
	}

	queryFormat := c.Query("format")
	if queryFormat == "yaml" || queryFormat == "json" || queryFormat == "hcl" {
		format = queryFormat
	}

	params := definitions.ExportQueryParams{
		Format:   format,
		Download: c.QueryBoolWithDefault("download", false),
	}

	return params
}

func exportResponse(c *contextmodel.ReqContext, body definitions.AlertingFileExport) response.Response {
	params := extractExportRequest(c)
	if params.Format == "hcl" {
		return exportHcl(params.Download, body)
	}

	if params.Download {
		r := response.JSONDownload
		if params.Format == "yaml" {
			r = response.YAMLDownload
		}
		return r(http.StatusOK, body, fmt.Sprintf("export.%s", params.Format))
	}

	r := response.JSON
	if params.Format == "yaml" {
		r = response.YAML
	}
	return r(http.StatusOK, body)
}

func exportHcl(download bool, body definitions.AlertingFileExport) response.Response {
	resources := make([]hcl.Resource, 0, len(body.Groups)+len(body.ContactPoints)+len(body.Policies))
	for idx, group := range body.Groups {
		gr := group
		resources = append(resources, hcl.Resource{
			Type: "grafana_rule_group",
			Name: fmt.Sprintf("rule_group_%04d", idx),
			Body: &gr,
		})
	}

	// TODO implement support.
	// for idx, cp := range ex.ContactPoints {
	// 	resources = append(resources, resourceBlock{
	// 		Type: "grafana_contact_point",
	// 		Name: fmt.Sprintf("contact_point_%d", idx),
	// 		Body: &cp,
	// 	})
	// }
	// for idx, cp := range ex.Policies {
	// 	resources = append(resources, resourceBlock{
	// 		Type: "grafana_notification_policy",
	// 		Name: fmt.Sprintf("notification_policy_%d", idx),
	// 		Body: &cp,
	// 	})
	//

	hclBody, err := hcl.Encode(resources...)
	if err != nil {
		return response.Error(500, "body hcl encode", err)
	}
	resp := response.Respond(http.StatusOK, hclBody)
	if download {
		return resp.
			SetHeader("Content-Type", "application/terraform+hcl").
			SetHeader("Content-Disposition", `attachment;filename=export.tf`)
	}
	return resp.SetHeader("Content-Type", "text/hcl")
}