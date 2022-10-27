import React from "react"
import { Button, Menu, MenuItem, ListItem, ListItemText, ListItemIcon} from "@mui/material";
import { Facebook, Twitter, Link } from '@mui/icons-material';
import language from "../languages/languages";

export default function DropdownShareButton(props) {

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
      };

    const handleShare = e => {
        e.preventDefault()

        const ahref = "https://wiediversistmeingarten.org/view/station/" +props.station_id+ "/" + props.mov_id
        const encodedAhref = encodeURIComponent(ahref)
        var link

        switch (e.currentTarget.id) {
            case "facebook":
                link = "https://www.facebook.com/sharer/sharer.php?u=" + ahref
                openLink(link)
                break

            case "twitter":
                link = "https://twitter.com/intent/tweet?url=" +encodedAhref
                openLink(link)
                break

            case "copy":
                navigator.clipboard.writeText(ahref)
                break

            default:
                break
        }
        handleClose()
    }

    const openLink = socialLink => {
        window.open(socialLink, "_blank")
    }

    return (

        <div>
            <Button
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                {language[props.language]["share"]["button"]}
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem id="facebook" onClick={handleShare}><ListItemIcon>
                                        <Facebook />
                                    </ListItemIcon>
                                    <ListItemText primary="Facebook" /></MenuItem>
                <MenuItem id="twitter" onClick={handleShare}><ListItemIcon>
                                        <Twitter />
                                    </ListItemIcon>
                                    <ListItemText primary="Twitter" /></MenuItem>
                <MenuItem  id="copy"onClick={handleShare}><ListItemIcon>
                                        <Link />
                                    </ListItemIcon>
                                    <ListItemText primary={language[props.language]["share"]["copy"]} /></MenuItem>
            </Menu>
           
        </div>
    )
}
       