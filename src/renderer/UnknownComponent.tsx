import { Alert, AlertTitle } from '@mui/material';

interface UnknownComponentProps {
  readonly type: string;
  readonly nodeId: string;
}

export function UnknownComponent({ type, nodeId }: UnknownComponentProps) {
  return (
    <Alert severity="warning" variant="outlined" sx={{ my: 1 }}>
      <AlertTitle>Unknown component</AlertTitle>
      {type} (node: {nodeId})
    </Alert>
  );
}
