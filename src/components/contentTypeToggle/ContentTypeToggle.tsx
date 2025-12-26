import React from 'react';
import classes from './ContentTypeToggle.module.css';

type ContentType = 'text' | 'file';

interface ContentTypeToggleProps {
  value: ContentType;
  onChange: (value: ContentType) => void;
  disabled?: boolean;
}

export const ContentTypeToggle: React.FC<ContentTypeToggleProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className={classes.container}>
      <button
        type="button"
        data-testid="content-type-text"
        className={value === 'text' ? classes.active : ''}
        onClick={() => onChange('text')}
        disabled={disabled}
      >
        TEXT
      </button>
      <button
        type="button"
        data-testid="content-type-file"
        className={value === 'file' ? classes.active : ''}
        onClick={() => onChange('file')}
        disabled={disabled}
      >
        FILE
      </button>
    </div>
  );
};
