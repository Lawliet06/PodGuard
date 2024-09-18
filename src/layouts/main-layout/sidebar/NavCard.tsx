import Background from 'assets/m2.jpg';

import { Card, CardContent, Typography, Button, Stack } from '@mui/material';

import mubas from '../../../assets/imgs/MUBAS.png';

const NavCard = () => {
  return (
    <Card
      sx={{
        background: `url(${Background}) no-repeat`,
        width: 238,
      }}
    >
      <CardContent sx={{ p: 1 }}>
        <Stack gap={1} alignItems="center" color="common.white">
          <img style={{ width: '6rem' }} src={mubas} alt="mubas" />
          <Typography variant="h4" style={{ textAlign: 'center', color: 'grey' }}>
            Mubas innovation hub
          </Typography>

          <Button
            variant="contained"
            sx={{
              mt: 3.75,
              px: 4,
              bgcolor: 'background.default',
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'common.white',
              },
            }}
          >
            <a
              style={{ textDecoration: 'none', color: '#002D62' }}
              href="https://unipod.ac.mw/"
              target="external"
            >
              Visit us
            </a>
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default NavCard;
