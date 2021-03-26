import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";

const DisclaimerDialog = () => {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle>Disclaimer</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This app is for development purposes only. As the developer, I make no
          guarantees as to the accuracy of the presented financial information,
          nor can I be held responsible for any losses you may incur as a result
          of using this service. Use of this app is considered acknowledgement
          and acceptance of these terms.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} autoFocus>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DisclaimerDialog;
