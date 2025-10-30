import * as Yup from 'yup';

export const CuisineFormSchema = Yup.object().shape({
  name: Yup.string()
    .max(30, 'You have reached the maximum limit')
    .trim()
    .matches(/\S/, 'Name cannot be only spaces')
    .required('Name is a required'),
  description: Yup.string()
    .max(100, 'You have reached the maximum limit of 100 characters!')
    .trim()
    .nullable()
    .notRequired(),
  shopType: Yup.object({
    label: Yup.string().required('Required'),
    code: Yup.string().required('Required'),
  }).required('Please choose one'),
  image: Yup.string().url().nullable().notRequired(),
});