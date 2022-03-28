import {
  Avatar,
  Badge,
  Grid,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext } from "react";
import { UsersContext } from "../../../../Context/AuthContext";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  TextFields: {
    typography: { xs: "body2", md: "body1" },
  },
}));

export function IndustryESICardComplete({ job }) {
  const { users } = useContext(UsersContext);
  const classes = useStyles();

  const buildChar = users.find((i) => i.CharacterID === job.installer_id);
  const blueprintData = buildChar.apiBlueprints.find(
    (i) => i.item_id === job.blueprint_id
  );

  let blueprintType = "bp";
  if (blueprintData === undefined || blueprintData.quantity === -2) {
    blueprintType = "bpc";
  }

  return (
    <Tooltip title="Job imported from the Eve ESI">
      <Grid key={job.job_id} item xs={16} sm={6} md={4} lg={3}>
        <Paper elevation={3} square={true} sx={{ padding: "10px" }}>
          <Grid container item xs={12}>
            <Grid item xs={12}>
              <Typography
                align="center"
                sx={{
                  minHeight: { xs: "2rem", sm: "3rem", md: "3rem", lg: "4rem" },
                  typography: { xs: "body1", lg: "h6" },
                }}
              >
                {job.product_name}
              </Typography>
            </Grid>
            <Grid
              container
              item
              xs={12}
              sx={{
                marginLeft: { xs: "10px", md: "0px" },
                marginRight: { xs: "20px", md: "30px" },
              }}
            >
              <Grid
                container
                item
                xs={2}
                sm={3}
                justifyContent="center"
                alignItems="center"
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  badgeContent={
                    <Avatar
                      src={`https://images.evetech.net/characters/${job.installer_id}/portrait`}
                      variant="circular"
                      sx={{
                        height: { xs: "16px", sm: "32px" },
                        width: { xs: "16px", sm: "32px" },
                      }}
                    />
                  }
                >
                  <picture>
                    <source
                      media="(max-width:700px)"
                      srcSet={`https://images.evetech.net/types/${job.blueprint_type_id}/${blueprintType}?size=32`}
                    />
                    <img
                      src={`https://images.evetech.net/types/${job.blueprint_type_id}/${blueprintType}?size=64`}
                      alt=""
                    />
                  </picture>
                </Badge>
              </Grid>
              <Grid
                container
                item
                xs={10}
                sm={9}
                sx={{ paddingLeft: { xs: "0px", sm: "5px" } }}
              >
                <Grid container item xs={12}>
                  <Grid item xs={4}>
                    <Typography className={classes.TextFields}>
                      Runs:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography className={classes.TextFields} align="right">
                      {job.runs}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container item xs={12}>
                  <Grid item xs={4}>
                    <Typography className={classes.TextFields}>
                      Status:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography className={classes.TextFields} align="right">
                      Delivered
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                backgroundColor: "rgba(204,204,204,0.5)",
                marginTop: "10px",
              }}
            >
              <Typography align="center" variant="body2" color="black">
                <b>ESI Manufacturing Job</b>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Tooltip>
  );
}
