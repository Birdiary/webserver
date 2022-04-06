import React from 'react';
 import { useFormik } from 'formik';
 import * as yup from 'yup';
 import Button from '@mui/material/Button';
 import TextField from '@mui/material/TextField';

 const validationSchema = yup.object({
  email: yup
    .string('Enter your email')
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string('Enter your password')
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required'),
});

  const BoxForm = () => {
  const formik = useFormik({
    initialValues: {
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          id="email"
          name="email"
          label="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <br/>
        <br/>
        <TextField
          id="password"
          name="password"
          label="Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />
        <br/>
        <br/>
        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </form>
    </div>
  );
 };

 class CreateBox extends React.Component {
    constructor(props){
      super(props);
      this.state = {
          id : props.id
      };
    };
  
    
  
    render() {
      return (
        <div style={{textAlign: "center"}}>
          <h1>Create a Box: </h1>
          <BoxForm></BoxForm>
          </div>
          
       
       
      )}
  }
  
  export default CreateBox