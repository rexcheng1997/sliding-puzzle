import React, { useState } from 'react';
import Logo from 'assets/favicon.svg';
import IconButton from '@material-ui/core/IconButton';
import MenuOpenRoundedIcon from '@material-ui/icons/MenuOpenRounded';
import HighlightOffRoundedIcon from '@material-ui/icons/HighlightOffRounded';
import { CSSTransition } from 'react-transition-group';

import Menu, { MenuProps } from 'components/Menu';

export default function Nav(props: MenuProps) {
  const [open, setOpen] = useState(false);

  return (<>
    <nav className='flex-row align-center justify-start'>
      <div className='logo'>
        <Logo/>
      </div>
      <h2 className='nav-title pacifico'>Sliding Puzzle</h2>
      <div className='mobile-menu-toggle' onClick={() => setOpen(!open)}>
        <IconButton aria-label='menu-toggle'>
          {open ? <HighlightOffRoundedIcon fontSize='large'/> : <MenuOpenRoundedIcon fontSize='large'/>}
        </IconButton>
      </div>
    </nav>
    <CSSTransition
      in={open}
      timeout={4e2}
      classNames='mobile-menu-transition'
      unmountOnExit>
      <div className='mobile-menu'>
        <Menu {...props}/>
      </div>
    </CSSTransition>
  </>);
};
