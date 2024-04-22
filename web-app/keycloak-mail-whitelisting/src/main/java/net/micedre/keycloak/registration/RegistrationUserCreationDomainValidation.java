package net.micedre.keycloak.registration;

import org.keycloak.authentication.ValidationContext;
import org.keycloak.authentication.forms.RegistrationPage;
import org.keycloak.authentication.forms.RegistrationProfile;
import org.keycloak.events.Details;
import org.keycloak.events.Errors;
import org.keycloak.models.AuthenticatorConfigModel;
import org.keycloak.models.utils.FormMessage;
import org.keycloak.services.messages.Messages;
import org.keycloak.services.validation.Validation;

import jakarta.ws.rs.core.MultivaluedMap;
import java.util.ArrayList;
import java.util.List;

public abstract class RegistrationUserCreationDomainValidation extends RegistrationProfile {

   protected static String domainListConfigName;
   protected static final String DEFAULT_DOMAIN_LIST = "example@example.org";
   protected static final String DOMAIN_LIST_SEPARATOR = "##";

   @Override
    public boolean isConfigurable() {
        return true;
   }

   @Override
   public void validate(ValidationContext context) {
      MultivaluedMap<String, String> formData = context.getHttpRequest().getDecodedFormParameters();

      List<FormMessage> errors = new ArrayList<>();
      String email = formData.getFirst(Validation.FIELD_EMAIL);

      AuthenticatorConfigModel mailDomainConfig = context.getAuthenticatorConfig();
      String eventError = Errors.INVALID_REGISTRATION;

      if(email == null){
         context.getEvent().detail(Details.EMAIL, email);
         errors.add(new FormMessage(RegistrationPage.FIELD_EMAIL, Messages.INVALID_EMAIL));
         context.error(eventError);
         context.validationError(formData, errors);
         return;
      }

      String[] domainList = mailDomainConfig.getConfig().getOrDefault(domainListConfigName, DEFAULT_DOMAIN_LIST).split(DOMAIN_LIST_SEPARATOR);
      boolean emailDomainValid = isEmailValid(email, domainList);

      if (!emailDomainValid) {
         context.getEvent().detail(Details.EMAIL, email);
         errors.add(new FormMessage(RegistrationPage.FIELD_EMAIL, Messages.INVALID_EMAIL));
      }
      if (errors.size() > 0) {
         context.error(eventError);
         context.validationError(formData, errors);
      } else {
         context.success();
      }
   }

   public abstract boolean isEmailValid(String email, String[] domains);
}

