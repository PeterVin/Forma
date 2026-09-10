import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { useId, useState } from 'react';

import { JsonValueSchema } from '../../document/schema';
import type { JsonValue } from '../../document/types';
import type { PropertyDefinition } from '../../../registry/types';

interface PropertyFieldProps {
  readonly definition: PropertyDefinition;
  readonly value: JsonValue | undefined;
  readonly onCommit: (value: JsonValue) => void;
}

function draftValue(value: JsonValue | undefined, editor: string): string {
  if (value === undefined) return '';
  if (editor === 'json') return JSON.stringify(value, null, 2);
  return typeof value === 'object' ? '' : String(value);
}

export function PropertyField({
  definition,
  value,
  onCommit,
}: PropertyFieldProps) {
  const fieldId = useId();
  const [draft, setDraft] = useState(() =>
    draftValue(value, definition.editor),
  );
  const [error, setError] = useState<string | null>(null);

  if (definition.editor === 'boolean') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={value === true}
            onChange={(_, checked) => onCommit(checked)}
            slotProps={{ input: { 'aria-label': definition.label } }}
          />
        }
        label={definition.label}
      />
    );
  }

  if (definition.editor === 'select') {
    const labelId = `${fieldId}-label`;
    const selectValue =
      value === null || ['string', 'number', 'boolean'].includes(typeof value)
        ? String(value ?? '')
        : '';
    return (
      <FormControl fullWidth size="small">
        <InputLabel id={labelId}>{definition.label}</InputLabel>
        <Select
          labelId={labelId}
          id={fieldId}
          value={selectValue}
          label={definition.label}
          onChange={(event) => {
            const option = definition.options?.find(
              (candidate) => String(candidate.value) === event.target.value,
            );
            if (option) onCommit(option.value);
          }}
        >
          <MenuItem value="" disabled>
            {typeof value === 'object' ? 'Responsive value' : 'Select…'}
          </MenuItem>
          {definition.options?.map((option) => (
            <MenuItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {definition.description ? (
          <FormHelperText>{definition.description}</FormHelperText>
        ) : null}
      </FormControl>
    );
  }

  const commitDraft = (): void => {
    if (definition.editor === 'number' || definition.editor === 'spacing') {
      const parsed = Number(draft);
      if (!Number.isFinite(parsed)) {
        setError('Enter a valid number.');
        return;
      }
      setError(null);
      if (parsed !== value) onCommit(parsed);
      return;
    }

    if (definition.editor === 'json') {
      try {
        const parsed: unknown = JSON.parse(draft);
        const result = JsonValueSchema.safeParse(parsed);
        if (!result.success) throw new Error('Value must be valid JSON.');
        setError(null);
        if (JSON.stringify(result.data) !== JSON.stringify(value))
          onCommit(result.data);
      } catch {
        setError('Enter valid JSON.');
      }
      return;
    }

    setError(null);
    if (draft !== value) onCommit(draft);
  };

  return (
    <TextField
      id={fieldId}
      label={definition.label}
      value={draft}
      type={
        definition.editor === 'number' || definition.editor === 'spacing'
          ? 'number'
          : 'text'
      }
      multiline={definition.editor === 'json'}
      minRows={definition.editor === 'json' ? 4 : undefined}
      size="small"
      fullWidth
      error={Boolean(error)}
      helperText={error ?? definition.description}
      placeholder={typeof value === 'object' ? 'Responsive value' : undefined}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commitDraft}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && definition.editor !== 'json') {
          event.currentTarget.blur();
        }
      }}
    />
  );
}
