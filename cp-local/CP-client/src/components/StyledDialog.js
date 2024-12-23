import { styled } from '@mui/material/styles';
import { Dialog } from '@mui/material';

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 8,
    padding: 0  
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)  
  }
}));

export const dialogProps = {
  disableEnforceFocus: true,  
  disableAutoFocus: false,     
  disablePortal: true,        
  keepMounted: true,

};