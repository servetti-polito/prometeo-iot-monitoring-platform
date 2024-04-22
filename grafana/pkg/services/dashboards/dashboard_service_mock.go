// Code generated by mockery v2.28.0. DO NOT EDIT.

package dashboards

import (
	context "context"

	model "github.com/grafana/grafana/pkg/services/search/model"
	mock "github.com/stretchr/testify/mock"

	user "github.com/grafana/grafana/pkg/services/user"
)

// FakeDashboardService is an autogenerated mock type for the DashboardService type
type FakeDashboardService struct {
	mock.Mock
}

// BuildSaveDashboardCommand provides a mock function with given fields: ctx, dto, shouldValidateAlerts, validateProvisionedDashboard
func (_m *FakeDashboardService) BuildSaveDashboardCommand(ctx context.Context, dto *SaveDashboardDTO, shouldValidateAlerts bool, validateProvisionedDashboard bool) (*SaveDashboardCommand, error) {
	ret := _m.Called(ctx, dto, shouldValidateAlerts, validateProvisionedDashboard)

	var r0 *SaveDashboardCommand
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *SaveDashboardDTO, bool, bool) (*SaveDashboardCommand, error)); ok {
		return rf(ctx, dto, shouldValidateAlerts, validateProvisionedDashboard)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *SaveDashboardDTO, bool, bool) *SaveDashboardCommand); ok {
		r0 = rf(ctx, dto, shouldValidateAlerts, validateProvisionedDashboard)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*SaveDashboardCommand)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *SaveDashboardDTO, bool, bool) error); ok {
		r1 = rf(ctx, dto, shouldValidateAlerts, validateProvisionedDashboard)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// CountInFolder provides a mock function with given fields: ctx, orgID, folderUID, _a3
func (_m *FakeDashboardService) CountInFolder(ctx context.Context, orgID int64, folderUID string, _a3 *user.SignedInUser) (int64, error) {
	ret := _m.Called(ctx, orgID, folderUID, _a3)

	var r0 int64
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, int64, string, *user.SignedInUser) (int64, error)); ok {
		return rf(ctx, orgID, folderUID, _a3)
	}
	if rf, ok := ret.Get(0).(func(context.Context, int64, string, *user.SignedInUser) int64); ok {
		r0 = rf(ctx, orgID, folderUID, _a3)
	} else {
		r0 = ret.Get(0).(int64)
	}

	if rf, ok := ret.Get(1).(func(context.Context, int64, string, *user.SignedInUser) error); ok {
		r1 = rf(ctx, orgID, folderUID, _a3)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// DeleteACLByUser provides a mock function with given fields: ctx, userID
func (_m *FakeDashboardService) DeleteACLByUser(ctx context.Context, userID int64) error {
	ret := _m.Called(ctx, userID)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, int64) error); ok {
		r0 = rf(ctx, userID)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// DeleteDashboard provides a mock function with given fields: ctx, dashboardId, orgId
func (_m *FakeDashboardService) DeleteDashboard(ctx context.Context, dashboardId int64, orgId int64) error {
	ret := _m.Called(ctx, dashboardId, orgId)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, int64, int64) error); ok {
		r0 = rf(ctx, dashboardId, orgId)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// FindDashboards provides a mock function with given fields: ctx, query
func (_m *FakeDashboardService) FindDashboards(ctx context.Context, query *FindPersistedDashboardsQuery) ([]DashboardSearchProjection, error) {
	ret := _m.Called(ctx, query)

	var r0 []DashboardSearchProjection
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *FindPersistedDashboardsQuery) ([]DashboardSearchProjection, error)); ok {
		return rf(ctx, query)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *FindPersistedDashboardsQuery) []DashboardSearchProjection); ok {
		r0 = rf(ctx, query)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]DashboardSearchProjection)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *FindPersistedDashboardsQuery) error); ok {
		r1 = rf(ctx, query)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetDashboard provides a mock function with given fields: ctx, query
func (_m *FakeDashboardService) GetDashboard(ctx context.Context, query *GetDashboardQuery) (*Dashboard, error) {
	ret := _m.Called(ctx, query)

	var r0 *Dashboard
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *GetDashboardQuery) (*Dashboard, error)); ok {
		return rf(ctx, query)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *GetDashboardQuery) *Dashboard); ok {
		r0 = rf(ctx, query)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*Dashboard)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *GetDashboardQuery) error); ok {
		r1 = rf(ctx, query)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetDashboardACLInfoList provides a mock function with given fields: ctx, query
func (_m *FakeDashboardService) GetDashboardACLInfoList(ctx context.Context, query *GetDashboardACLInfoListQuery) ([]*DashboardACLInfoDTO, error) {
	ret := _m.Called(ctx, query)

	var r0 []*DashboardACLInfoDTO
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *GetDashboardACLInfoListQuery) ([]*DashboardACLInfoDTO, error)); ok {
		return rf(ctx, query)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *GetDashboardACLInfoListQuery) []*DashboardACLInfoDTO); ok {
		r0 = rf(ctx, query)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*DashboardACLInfoDTO)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *GetDashboardACLInfoListQuery) error); ok {
		r1 = rf(ctx, query)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetDashboardTags provides a mock function with given fields: ctx, query
func (_m *FakeDashboardService) GetDashboardTags(ctx context.Context, query *GetDashboardTagsQuery) ([]*DashboardTagCloudItem, error) {
	ret := _m.Called(ctx, query)

	var r0 []*DashboardTagCloudItem
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *GetDashboardTagsQuery) ([]*DashboardTagCloudItem, error)); ok {
		return rf(ctx, query)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *GetDashboardTagsQuery) []*DashboardTagCloudItem); ok {
		r0 = rf(ctx, query)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*DashboardTagCloudItem)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *GetDashboardTagsQuery) error); ok {
		r1 = rf(ctx, query)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetDashboardUIDByID provides a mock function with given fields: ctx, query
func (_m *FakeDashboardService) GetDashboardUIDByID(ctx context.Context, query *GetDashboardRefByIDQuery) (*DashboardRef, error) {
	ret := _m.Called(ctx, query)

	var r0 *DashboardRef
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *GetDashboardRefByIDQuery) (*DashboardRef, error)); ok {
		return rf(ctx, query)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *GetDashboardRefByIDQuery) *DashboardRef); ok {
		r0 = rf(ctx, query)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*DashboardRef)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *GetDashboardRefByIDQuery) error); ok {
		r1 = rf(ctx, query)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetDashboards provides a mock function with given fields: ctx, query
func (_m *FakeDashboardService) GetDashboards(ctx context.Context, query *GetDashboardsQuery) ([]*Dashboard, error) {
	ret := _m.Called(ctx, query)

	var r0 []*Dashboard
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *GetDashboardsQuery) ([]*Dashboard, error)); ok {
		return rf(ctx, query)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *GetDashboardsQuery) []*Dashboard); ok {
		r0 = rf(ctx, query)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*Dashboard)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *GetDashboardsQuery) error); ok {
		r1 = rf(ctx, query)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// ImportDashboard provides a mock function with given fields: ctx, dto
func (_m *FakeDashboardService) ImportDashboard(ctx context.Context, dto *SaveDashboardDTO) (*Dashboard, error) {
	ret := _m.Called(ctx, dto)

	var r0 *Dashboard
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *SaveDashboardDTO) (*Dashboard, error)); ok {
		return rf(ctx, dto)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *SaveDashboardDTO) *Dashboard); ok {
		r0 = rf(ctx, dto)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*Dashboard)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *SaveDashboardDTO) error); ok {
		r1 = rf(ctx, dto)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SaveDashboard provides a mock function with given fields: ctx, dto, allowUiUpdate
func (_m *FakeDashboardService) SaveDashboard(ctx context.Context, dto *SaveDashboardDTO, allowUiUpdate bool) (*Dashboard, error) {
	ret := _m.Called(ctx, dto, allowUiUpdate)

	var r0 *Dashboard
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *SaveDashboardDTO, bool) (*Dashboard, error)); ok {
		return rf(ctx, dto, allowUiUpdate)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *SaveDashboardDTO, bool) *Dashboard); ok {
		r0 = rf(ctx, dto, allowUiUpdate)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*Dashboard)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *SaveDashboardDTO, bool) error); ok {
		r1 = rf(ctx, dto, allowUiUpdate)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SearchDashboards provides a mock function with given fields: ctx, query
func (_m *FakeDashboardService) SearchDashboards(ctx context.Context, query *FindPersistedDashboardsQuery) (model.HitList, error) {
	ret := _m.Called(ctx, query)

	var r0 model.HitList
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, *FindPersistedDashboardsQuery) (model.HitList, error)); ok {
		return rf(ctx, query)
	}
	if rf, ok := ret.Get(0).(func(context.Context, *FindPersistedDashboardsQuery) model.HitList); ok {
		r0 = rf(ctx, query)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(model.HitList)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, *FindPersistedDashboardsQuery) error); ok {
		r1 = rf(ctx, query)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// UpdateDashboardACL provides a mock function with given fields: ctx, uid, items
func (_m *FakeDashboardService) UpdateDashboardACL(ctx context.Context, uid int64, items []*DashboardACL) error {
	ret := _m.Called(ctx, uid, items)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, int64, []*DashboardACL) error); ok {
		r0 = rf(ctx, uid, items)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

type mockConstructorTestingTNewFakeDashboardService interface {
	mock.TestingT
	Cleanup(func())
}

// NewFakeDashboardService creates a new instance of FakeDashboardService. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
func NewFakeDashboardService(t mockConstructorTestingTNewFakeDashboardService) *FakeDashboardService {
	mock := &FakeDashboardService{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}