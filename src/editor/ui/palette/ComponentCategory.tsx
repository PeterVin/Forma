import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from '@mui/material';

import type { ComponentDefinition } from '../../../registry/types';
import { ComponentPaletteItem } from './ComponentPaletteItem';

interface ComponentCategoryProps {
  readonly label: string;
  readonly definitions: readonly ComponentDefinition[];
  readonly onAdd: (definition: ComponentDefinition) => void;
}

export function ComponentCategory({
  label,
  definitions,
  onAdd,
}: ComponentCategoryProps) {
  return (
    <Accordion
      defaultExpanded
      disableGutters
      elevation={0}
      sx={{ '&::before': { display: 'none' } }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon fontSize="small" />}
        aria-controls={`palette-${label}-content`}
        id={`palette-${label}-header`}
        sx={{
          minHeight: 36,
          px: 1.5,
          '& .MuiAccordionSummary-content': { my: 0.5 },
        }}
      >
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        id={`palette-${label}-content`}
        sx={{ px: 1.5, pt: 0, pb: 1.5 }}
      >
        <Stack spacing={0.75}>
          {definitions.map((definition) => (
            <ComponentPaletteItem
              key={definition.type}
              definition={definition}
              onAdd={onAdd}
            />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
