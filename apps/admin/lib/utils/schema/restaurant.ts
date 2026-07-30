import * as Yup from 'yup';
import { IDropdownSelectItem } from '../interfaces';

export const RestaurantSchema = Yup.object().shape({
  name: Yup.string()
    .max(35)
    .trim()
    .matches(/\S/, 'Name cannot be only spaces')
    .required('Required'),
  username: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string()
  .test('min-length', 'At least 6 characters', (value) => !value || value.length >= 6)
  .matches(/[a-z]/, { message: 'At least one lowercase letter (a-z)', excludeEmptyString: true })
  .matches(/[A-Z]/, { message: 'At least one uppercase letter (A-Z)', excludeEmptyString: true })
  .matches(/[0-9]/, { message: 'At least one number (0-9)', excludeEmptyString: true })
  .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, { message: 'At least one special character', excludeEmptyString: true }),
  confirmPassword: Yup.string()
    .nullable()
    .test('passwords-match', 'Password must match', function (value) {
      const { password } = this.parent;
      if (!password) return true;
      return value === password;
    }),
    address: Yup.string()
    .max(100, 'Maximum 100 characters allowed')
    .trim()
    .matches(/\S/, 'Address cannot be only spaces')
    .matches(/[a-zA-Z]/, 'Address must contain at least one letter.')
    .required('Required'),
  
  deliveryTime: Yup.number()
    .required('Required')
    .min(1, 'The value must be greater than or equal to 1'),
  minOrder: Yup.number()
    .required('Required')
    .min(1, 'The value must be greater than or equal to 1'),
  salesTax: Yup.number().required('Required'),
  shopType: Yup.mixed<IDropdownSelectItem>().required('Required'),
  cuisines: Yup.array()
    .of(Yup.mixed<IDropdownSelectItem>())
    .min(1, 'Cuisines field must have at least 1 items')
    .required('Required'),

  image: Yup.string().url('Invalid image URL').required('Required'),
  logo: Yup.string().url('Invalid logo URL').required('Required'),
  phoneNumber: Yup.string().required('Required').min(5,"Minimum 5 Numbers are Required"),
});