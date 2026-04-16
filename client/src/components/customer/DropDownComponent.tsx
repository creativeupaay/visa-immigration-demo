import React from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

const DropDownComponent = ({ label,options }:{label:string,options:string[]}) => {
  const [selectedValue, setSelectedValue] = React.useState<string>("");

  const handleChange = (event:any) => {
    setSelectedValue(event.target.value as string);
  };

  return (
    <FormControl sx={{
      width:"200px"
    }}>
      <InputLabel>{label}</InputLabel>
      <Select value={selectedValue} onChange={handleChange}>
        {options.map((option, index) => (
          <MenuItem key={index} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DropDownComponent;
