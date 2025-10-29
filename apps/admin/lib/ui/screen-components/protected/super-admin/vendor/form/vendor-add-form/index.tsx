// Core
import { ApolloError, useMutation } from '@apollo/client';
import { Form, Formik } from 'formik';
import { useContext, useEffect, useState } from 'react';

// Prime React
import { Sidebar } from 'primereact/sidebar';

// Context
import { ToastContext } from '@/lib/context/global/toast.context';
import { VendorContext } from '@/lib/context/super-admin/vendor.context';

// Interface and Types
import {
  IGetVendorResponseGraphQL,
  ILazyQueryResult,
  IVendorAddFormComponentProps,
} from '@/lib/utils/interfaces';
import { IVendorForm } from '@/lib/utils/interfaces/forms';

// Constants and Methods
import { MAX_SQUARE_FILE_SIZE, VendorErrors } from '@/lib/utils/constants';
import { onErrorMessageMatcher } from '@/lib/utils/methods/error';

// Components
import CustomButton from '@/lib/ui/useable-components/button';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomIconTextField from '@/lib/ui/useable-components/input-icon-field';
import CustomPasswordTextField from '@/lib/ui/useable-components/password-input-field';
import CustomUploadImageComponent from '@/lib/ui/useable-components/upload/upload-image';

// Schema
import { VendorEditSchema, VendorSchema } from '@/lib/utils/schema';

// GraphQL
import {
  CREATE_VENDOR,
  EDIT_VENDOR,
  GET_VENDOR_BY_ID,
} from '@/lib/api/graphql';

// Icons
import { useLazyQueryQL } from '@/lib/hooks/useLazyQueryQL';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import CustomPhoneTextField from '@/lib/ui/useable-components/phone-input-field';
import { useTranslations } from 'next-intl';

const initialValues: IVendorForm = {
  // name: '',
  email: '',
  password: '',
  confirmPassword: '',
  image: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
};

export default function VendorAddForm({
  position = 'right',
}: IVendorAddFormComponentProps) {
  // Hooks
  const t = useTranslations();

  // Context
  const {
    vendorFormVisible,
    onSetVendorFormVisible,
    vendorId,
    isEditingVendor,
    vendorResponse,
  } = useContext(VendorContext);
  const { showToast } = useContext(ToastContext);

  // States
  const [formInitialValues, setFormValues] = useState<IVendorForm>({
    ...initialValues,
  });

  // Mutations
  const [editVendor] = useMutation(EDIT_VENDOR); 
  const [createVendor] = useMutation(
    isEditingVendor && vendorId ? EDIT_VENDOR : CREATE_VENDOR,
    {
      //  refetchQueries: [{ query: GET_VENDORS, fetchPolicy: 'network-only' }],
      onError,
      onCompleted: () => {
        showToast({
          type: 'success',
          title: t('New Vendor'),
          message: `${t('Vendor has been')} ${isEditingVendor ? t('edited') : t('added')} ${t('successfully')}`,
          duration: 3000,
        });

        onSetVendorFormVisible(false);
        vendorResponse.refetch();
      },
    }
  );

  const {
    fetch: fetchVendorById,
    loading,
    data,
  } = useLazyQueryQL(GET_VENDOR_BY_ID, {
    fetchPolicy: 'network-only',
    debounceMs: 300,
  }) as ILazyQueryResult<IGetVendorResponseGraphQL | undefined, { id: string }>;

  // Handlers
  const compactInput = <T extends Record<string, any>>(obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj)
      // remove undefined, null, or empty strings
      .filter(([, v]) => v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === ''))
  ) as Partial<T>;

const onVendorCreate = async (data: IVendorForm) => {
  try {
    // Build a minimal input and drop empty/undefined values
    const base = {
      // Only include _id when editing
      ...(isEditingVendor && vendorId ? { _id: vendorId } : {}),
      name: [data.firstName, data.lastName].filter(Boolean).join(' ') || undefined,
      email: data.email,
      image: data.image || undefined,
      firstName: (data as any).firstName || undefined,
      lastName: (data as any).lastName || undefined,
      phoneNumber: data.phoneNumber ? String(data.phoneNumber) : undefined,
      // Send password ONLY if provided
      password: data.password ? String(data.password) : undefined,
    };

    const variables = { vendorInput: compactInput(base) };

    // Call the proper mutation depending on the mode
    const { data: result } = isEditingVendor && vendorId
      ? await editVendor({ variables })
      : await createVendor({ variables });

    const payload = isEditingVendor ? result?.editVendor : result?.createVendor;
    if (!payload?._id) {
      throw new Error(`${isEditingVendor ? 'Edit' : 'Create'} Vendor returned no data`);
    }

    showToast({
      type: 'success',
      title: isEditingVendor ? t('Edit Vendor') : t('New Vendor'),
      message: isEditingVendor
        ? t('Vendor has been edited successfully')
        : t('Vendor has been added successfully'),
      duration: 3000,
    });

    // Close the drawer and refresh the vendor list in the parent context
    onSetVendorFormVisible(false);
    try {
      await vendorResponse.refetch();
    } catch {
      /* ignore refetch errors */
    }
  } catch (error: any) {
    console.log('error during add/edit vendor ==> ', error);
    showToast({
      type: 'error',
      title: isEditingVendor ? t('Edit Vendor') : t('Create Vendor'),
      message:
        error?.graphQLErrors?.[0]?.message ??
        error?.message ??
        (isEditingVendor ? t('Vendor Edit Failed') : t('Vendor Create Failed')),
      duration: 3000,
    });
  }
};

  function onError({ graphQLErrors, networkError }: ApolloError) {
    showToast({
      type: 'error',
      title: `${isEditingVendor ? t('Edit') : t('Create')} ${t('Vendor')}`,
      message:
        graphQLErrors[0]?.message ??
        networkError?.message ??
        `${t('Vendor')} ${isEditingVendor ? t('Edit') : t('Create')} ${t('Failed')}`,
      duration: 2500,
    });
  }

  const onFetchVendorById = () => {
    setFormValues(initialValues);
    if (isEditingVendor && vendorId) {
      fetchVendorById({ id: vendorId ?? '' });
    }
  };

  const onHandleSetFormValue = () => {
    if (!data) return;
    setFormValues((prevState) => ({
      ...initialValues,
      ...prevState,
      ...data?.getVendor,
      password: data?.getVendor?.plainPassword ?? '',
      confirmPassword: data?.getVendor?.plainPassword ?? '',
      image: data?.getVendor?.image ?? '',
    }));
  };
  // Use Effects
  useEffect(() => {
    onFetchVendorById();
  }, [isEditingVendor, vendorId]);

  useEffect(() => {
    onHandleSetFormValue();
  }, [data]);

  return (
    <Sidebar
      visible={vendorFormVisible}
      position={position}
      onHide={() => onSetVendorFormVisible(false, false)}
      className="w-full sm:w-[450px]"
    >
      <div className="flex h-full w-full items-center justify-start">
        <div className="h-full w-full">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex flex-col">
              <span className="text-lg">
                {isEditingVendor ? t('Edit') : t('Add')} {t('Vendor')}
              </span>
            </div>

            <div>
              <Formik
                initialValues={formInitialValues}
                validationSchema={
                  isEditingVendor && vendorId ? VendorEditSchema : VendorSchema
                }
                enableReinitialize={true}
                validateOnChange={false}
                onSubmit={async (values) => {
                  await onVendorCreate(values);
                }}
              >
                {({
                  values,
                  errors,
                  handleChange,
                  handleSubmit,
                  isSubmitting,
                  setFieldValue,
                }) => {
                  return (
                    <Form onSubmit={handleSubmit}>
                      <div className="space-y-3">
                        <CustomTextField
                          type="text"
                          name="firstName"
                          placeholder={t('First Name')}
                          maxLength={35}
                          value={values.firstName}
                          onChange={handleChange}
                          isLoading={loading}
                          showLabel={true}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'firstName',
                              errors?.firstName,
                              VendorErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                        <CustomTextField
                          type="text"
                          name="lastName"
                          placeholder={t('Last Name')}
                          maxLength={35}
                          value={values.lastName}
                          onChange={handleChange}
                          isLoading={loading}
                          showLabel={true}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'lastName',
                              errors?.lastName,
                              VendorErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                        <CustomIconTextField
                          type="email"
                          name="email"
                          placeholder={t('Email')}
                          maxLength={35}
                          showLabel={true}
                          iconProperties={{
                            icon: faEnvelope,
                            position: 'right',
                            style: { marginTop: '1px' },
                          }}
                          value={values.email}
                          isLoading={loading}
                          onChange={handleChange}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'email',
                              errors?.email,
                              VendorErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        <CustomPhoneTextField
                          mask="999-999-9999"
                          name="phoneNumber"
                          showLabel={true}
                          isLoading={loading}
                          placeholder={t('Phone Number')}
                          value={values.phoneNumber}
                          onChange={(e) => {
                            setFieldValue('phoneNumber', e);
                            // setCountryCode(code);
                          }}
                          type="text"
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'phoneNumber',
                              errors?.phoneNumber,
                              VendorErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        <CustomPasswordTextField
                          autoComplete="new-password"
                          placeholder={t('Password')}
                          name="password"
                          maxLength={20}
                          value={values.password}
                          showLabel={true}
                          isLoading={loading}
                          onChange={handleChange}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'password',
                              errors?.password,
                              VendorErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        <CustomPasswordTextField
                          autoComplete="new-password"
                          placeholder={t('Confirm Password')}
                          name="confirmPassword"
                          maxLength={20}
                          showLabel={true}
                          isLoading={loading}
                          value={values.confirmPassword ?? ''}
                          onChange={handleChange}
                          feedback={false}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'confirmPassword',
                              errors?.confirmPassword,
                              VendorErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                        <CustomUploadImageComponent
                          key="image"
                          name="image"
                          title={t('Upload Image')}
                          fileTypes={['image/jpg', 'image/webp', 'image/jpeg']}
                          maxFileHeight={1080}
                          maxFileWidth={1080}
                          maxFileSize={MAX_SQUARE_FILE_SIZE}
                          orientation="SQUARE"
                          onSetImageUrl={setFieldValue}
                          existingImageUrl={values.image}
                          showExistingImage={isEditingVendor ? true : false}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'image',
                              errors?.image as string,
                              VendorErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        <div className="py-4 flex justify-end">
                          <CustomButton
                            className="h-10 w-fit border-gray-300 bg-black px-8 text-white"
                            label={isEditingVendor ? t('Update') : t('Add')}
                            type="submit"
                            loading={isSubmitting}
                          />
                        </div>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
