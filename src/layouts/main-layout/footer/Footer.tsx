import { Box, Link, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Typography
      variant="h6"
      component="footer"
      sx={{ pt: 3.75, textAlign: { xs: 'center', md: 'right' } }}
    >
      Made {' '}
      <Box component="span" sx={{ color: 'error.main', verticalAlign: 'middle' }}>
        
      </Box>{' '}
      by{' '}
      <Link
        href="linkedin.com/in/lawrence-biston-kasuntha-382271225"
        target="_blank"
        rel="noopener"
        sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }}
      >
        Lawliet
      </Link>
    </Typography>
  );
};

export default Footer;
