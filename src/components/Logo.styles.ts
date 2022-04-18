import { createStyles } from '@mantine/core';

export default createStyles((theme) => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',

    '& svg': {
      display: 'block',
    },
  },

  logo: {
    ...theme.fn.focusStyles(),
    textDecoration: 'none',
    userSelect: 'none',
    color: theme.black,
    display: 'block',
  },

  image: {
    height: 60,
  },
}));
