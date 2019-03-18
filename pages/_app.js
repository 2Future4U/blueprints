import React from 'react'
import App, {Container} from 'next/app'
import {MDXProvider} from '@mdx-js/tag'
import {withMDXLive} from 'mdx-live'
import Head from 'next/head'
import * as primerComponents from '@primer/components'
import * as docsComponents from '../src/components'
import {config, requirePage, rootPage} from '../src/utils'
import {CONTENT_MAX_WIDTH} from '../src/constants'

export const H1 = props => <Heading fontSize={6} fontWeight="light" {...props} />
const {Header, SideNav, RouteMatch, PrimerHeader, NavDropdown, NavItem, Section, Link, Outline} = docsComponents
const {BaseStyles, BorderBox, Box, Flex, theme, Heading} = primerComponents

function getComponents(page = {}) {
  const {outline: getOutline = () => []} = page

  return {
    h1: H1,
    a: Link,
    code: withMDXLive('pre'),
    p: ({children, ...rest}) => {
      if (children === '{:toc}') {
        return <Outline outline={getOutline()} {...rest} />
      } else {
        return <p {...rest}>{children}</p>
      }
    },
    // "unwrap" <pre> elements around <code> blocks
    pre: props => props.children,
    ...docsComponents,
    ...primerComponents
  }
}

export default class MyApp extends App {
  static async getInitialProps({Component, ctx}) {
    let page = {}

    if (Component.getInitialProps) {
      page = await Component.getInitialProps(ctx)
    }

    return {page}
  }

  render() {
    // strip the trailing slash
    const pathname = this.props.router.pathname.replace(/\/$/, '')
    const {Component, page} = this.props

    const node = rootPage.first(node => node.path === pathname) || {}
    const {file, meta = {}} = node || {}

    const Hero = file ? requirePage(file).Hero : null

    return (
      <BaseStyles fontSize={2} style={{fontFamily: theme.fonts.normal}}>
        <Container>
          <Head>
            <title>Primer Blueprints{meta.title ? ` / ${meta.title}` : null}</title>
          </Head>
          <PrimerHeader root={'/blueprints'}/>
          <Flex
            flexDirection={['column', 'column', 'column', 'row-reverse']}
            alignContent="stretch"
            justifyContent="space-between"
          >
            <Box width={['auto', 'auto', '100%']}>
              {Hero ? <Hero /> : null}
              <Box color="gray.9" maxWidth={['auto', 'auto', 'auto', CONTENT_MAX_WIDTH]} px={6} mx="auto" my={6}>
                <div className="markdown-body">
                  {!meta.hero && meta.title ? <h1>{meta.title}</h1> : null}
                  <MDXProvider components={getComponents(node)}>
                    <Component {...page} />
                  </MDXProvider>
                  {config.production ? null : (
                    <details>
                      <summary>Metadata</summary>
                      <pre>{JSON.stringify(meta, null, 2)}</pre>
                    </details>
                  )}
                </div>
              </Box>
            </Box>
            <BorderBox
              width={['100%', '100%', 256]}
              minWidth={256}
              bg="gray.0"
              borderColor="gray.2"
              borderRadius={0}
              border={0}
              borderRight={1}
              borderTop={[1, 1, 0, 0]}
            >
              <SideNav>
                <RouteMatch path="/blueprints">
                  <Section path="content-components" />
                  <Section path="navigation-components" />
                </RouteMatch>
              </SideNav>
            </BorderBox>
          </Flex>
        </Container>
      </BaseStyles>
    )
  }
}
