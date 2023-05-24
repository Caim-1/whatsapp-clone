import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { Field, useField } from 'formik';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TextField = ({ label, ...props }: any) => {
  const [field, meta] = useField(props);

  return (
    <FormControl isInvalid={!(!meta.touched) && !(!meta.error)}>
      <FormLabel>{label}</FormLabel>
      <Input as={Field} {...field} {...props} />
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
};

export default TextField;