import { Link, Stack, SxProps } from '@mui/material';

import { rootPaths } from 'routes/paths';

import unipod from '../../../assets/imgs/podguard3.png';

interface LogoHeaderProps {
  sx?: SxProps;
}
const LogoHeader = (props: LogoHeaderProps) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      columnGap={3}
      component={Link}
      href={rootPaths.root}
      {...props}
    >
      <img style={{ width: '11rem' }} src={unipod} alt="podguard" />
    </Stack>
  );
};

export default LogoHeader;
