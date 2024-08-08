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
  