import React, { useState } from "react";
import {
  Switch,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { ServiceCategory } from "./ServiceManagement";

interface ServiceManagementProps {
  data: ServiceCategory[];
  onToggle: (category: string, serviceName: string, enabled: boolean) => void;
}

const ServiceManagementComponent: React.FC<ServiceManagementProps> = ({
  data,
  onToggle,
}) => {
  const [services, setServices] = useState<ServiceCategory[]>(data);

  const handleToggle = (category: string, serviceName: string) => {
    setServices((prevServices) =>
      prevServices.map((group) =>
        group.category === category
          ? {
              ...group,
              services: group.services.map((service) =>
                service.name === serviceName
                  ? { ...service, enabled: !service.enabled }
                  : service
              ),
            }
          : group
      )
    );

    const updatedService = services
      .find((g) => g.category === category)
      ?.services.find((s) => s.name === serviceName);

    if (updatedService) {
      onToggle(category, serviceName, !updatedService.enabled);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      {services.map((group, index) => (
        <Box key={index} sx={{ marginBottom: 5 }}>
          <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb:1
          }}
          >
          <Typography sx={{ fontSize: "15px", color: "#777" }}>
            {group.category}
          </Typography>
          <Typography sx={{ fontSize: "15px", color: "#777" }}>
            Action
          </Typography>
          </Box>
          
          <Divider sx={{ marginY: 1 }} />
          {group.services.map((service, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography>{service.name}</Typography>
              <Switch
                checked={service.enabled}
                onChange={() => handleToggle(group.category, service.name)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "white", 
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "green",
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default ServiceManagementComponent;
