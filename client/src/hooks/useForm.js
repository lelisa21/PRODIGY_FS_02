import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validate = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (touched[name] && validate) {
      const validationErrors = validate(values);
      setErrors(prev => ({
        ...prev,
        [name]: validationErrors[name],
      }));
    }
  }, [touched, validate, values]);
  
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(prev => ({
        ...prev,
        [name]: validationErrors[name],
      }));
    }
  }, [validate, values]);
  
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, values]);
  
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);
  
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, []);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
  };
};
