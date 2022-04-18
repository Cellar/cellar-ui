import { createStyles } from '@mantine/styles';

export const HEADER_HEIGHT = 120;

export default createStyles((theme) => ({
  header: {
    position: 'fixed',
    zIndex: 10000,
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    backgroundColor: theme.colors.gray[3],
  },

  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: "center",
    verticalAlign: "middle",
    height: '100%',
  },

  banner: {
    backgroundColor: theme.colors.green[5]
  },
}));
