import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
  } from 'class-validator';
  
  @ValidatorConstraint({ async: false })
  class IsPasswordRequiredConstraint implements ValidatorConstraintInterface {
    validate(password: any, args: ValidationArguments) {
      const object = args.object as any;
      // Si isApiUser es verdadero, el password puede ser null o undefined.
      // Si isApiUser es falso o undefined, el password debe estar presente.
      if (object.isApiUser) {
        return true;
      }
      return password != null && password.length > 0;
    }
  
    defaultMessage(args: ValidationArguments) {
      return 'Password is required unless the user is an API user.';
    }
  }
  
  export function IsPasswordRequired(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [],
        validator: IsPasswordRequiredConstraint,
      });
    };
  }
  