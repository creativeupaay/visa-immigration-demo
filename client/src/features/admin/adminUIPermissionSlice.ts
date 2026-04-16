import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminPermissionsState {
  Read_Dashboard_Tab:boolean
  Read_RevenueByLocation:boolean,
  Read_DashboardAnalytics:boolean,
  Read_RecentData:boolean,

  Read_Application_Tab: boolean;
  Read_Consultation_Tab: boolean;
  Read_LeadManagement_Tab: boolean;
  Read_RoleAndPermission_Tab:boolean;
  
  Read_TaskManagement_Tab:boolean;
  Read_AllTasks_Tab:boolean;

  Read_ManageBankDetails_Tab:boolean;
  Read_MyClients_Tab:boolean;

}

const initialState: AdminPermissionsState = {
  Read_Dashboard_Tab:false,
  Read_RevenueByLocation:false,
  Read_DashboardAnalytics:false,
  Read_RecentData:false,
  Read_Application_Tab: false,
  Read_Consultation_Tab: false,
  Read_LeadManagement_Tab: false,
  Read_RoleAndPermission_Tab:false,
  Read_TaskManagement_Tab:false,
  Read_AllTasks_Tab:false,
  Read_ManageBankDetails_Tab:false,
  Read_MyClients_Tab:false,
};

const adminPermissionsSlice = createSlice({
  name: 'adminPermissions',
  initialState,
  reducers: {
    setPermissions(state, action: PayloadAction<AdminPermissionsState>) {
      return { ...state, ...action.payload };
    },
    clearPermissions() {
      return {
        Read_Dashboard_Tab:false,
        Read_RevenueByLocation:false,
        Read_DashboardAnalytics:false,
        Read_RecentData:false,
        Read_Application_Tab: false,
        Read_Consultation_Tab: false,
        Read_LeadManagement_Tab: false,
        Read_RoleAndPermission_Tab:false,
        Read_TaskManagement_Tab:false,
        Read_AllTasks_Tab:false,
        Read_ManageBankDetails_Tab:false,
        Read_MyClients_Tab:false,
      };
    },
  },
});

export const { setPermissions, clearPermissions } = adminPermissionsSlice.actions;
export default adminPermissionsSlice.reducer;
