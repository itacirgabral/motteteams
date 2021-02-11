import React from 'react'
import FooterEXE from '.'

const toExp = {
  title: 'ZAPQL/Footer',
  component: FooterEXE,
}
export default toExp

const Template = (args) => <FooterEXE {...args} />;

export const Footer = Template.bind({});

Footer.args = {
  /* the args you need here will depend on your component */
};