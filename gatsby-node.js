const _ = require('lodash')
const path = require('path')
const webpack = require('webpack')
// const { createFilePath } = require('gatsby-source-filesystem');

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  return graphql(`
    {
      allMarkdownRemark(limit: 1000) {
        edges {
          node {
            id
            frontmatter {
              template
              title
            }
            fields {
              slug
              contentType
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      result.errors.forEach(e => console.error(e.toString()))
      return Promise.reject(result.errors)
    }

    const mdFiles = result.data.allMarkdownRemark.edges

    const contentTypes = _.groupBy(mdFiles, 'node.fields.contentType')

    _.each(contentTypes, (pages, contentType) => {
      const pagesToCreate = pages.filter(page =>
        _.get(page, `node.frontmatter.template`)
      )
      if (!pagesToCreate.length) return console.log(`Skipping ${contentType}`)

      console.log(`Creating ${pagesToCreate.length} ${contentType}`)

      pagesToCreate.forEach((page, index) => {
        const id = page.node.id
        createPage({
          path: page.node.fields.slug,
          component: path.resolve(
            `src/templates/${String(page.node.frontmatter.template)}.js`
          ),
          context: { id },
        })
      })
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  let slug
  if (node.internal.type === 'MarkdownRemark') {
    const fileNode = getNode(node.parent)
    const parsedFilePath = path.parse(fileNode.relativePath)

    if (_.get(node, 'frontmatter.slug')) {
      slug = `/${node.frontmatter.slug.toLowerCase()}/`
    } else if (
      parsedFilePath.name === 'home' &&
      parsedFilePath.dir === 'pages'
    ) {
      slug = `/`
    } else if (_.get(node, 'frontmatter.title')) {
      slug = `/${_.kebabCase(parsedFilePath.dir)}/${_.kebabCase(
        node.frontmatter.title
      )}/`
    } else if (parsedFilePath.dir === '') {
      slug = `/${parsedFilePath.name}/`
    } else {
      slug = `/${parsedFilePath.dir}/`
    }

    createNodeField({ node, name: 'slug', value: slug })
    createNodeField({ node, name: 'contentType', value: parsedFilePath.dir })
  }
}

// exports.onCreateWebpackConfig = ({ getConfig, actions }) => {
//   const config = getConfig();

//   actions.setWebpackConfig({
//     resolve: {
//       fallback: {
//         path: require.resolve('path-browserify'),
//         process: require.resolve('process/browser'),
//       },
//     },
//     plugins: [
//       new webpack.ProvidePlugin({
//         process: 'process/browser',
//       }),
//     ],
//     devtool: config.mode === 'production' ? false : config.devtool,
//   });
// };
exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      fallback: {
        path: require.resolve('path-browserify'),
        process: require.resolve('process/browser'),
        // add other necessary polyfills
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
  })
}
