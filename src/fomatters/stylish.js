import _ from 'lodash';

const generateSpacesWithSign = (multiplier) => ' '.repeat(4 * multiplier - 2);

const generateSpacesWithoutSign = (multiplier) => ' '.repeat(4 * multiplier);

const checkObj = (node, multiplier) => {
  if (_.isObject(node)) {
    const entries = Object.entries(node);
    const deepObjects = entries
      .reduce((acc, [key, value]) => `${acc}\n${generateSpacesWithoutSign(multiplier)}${key}: ${checkObj(value, multiplier + 1)}`, '');
    return `{${deepObjects}\n${generateSpacesWithoutSign(multiplier - 1)}}`;
  }
  return node;
};

const stylish = (ast) => {
  const iter = (tree, multiplier) => {
    const spacesWithoutSign = generateSpacesWithoutSign(multiplier);
    const spacesWithSign = generateSpacesWithSign(multiplier);
    const result = tree.map((node) => {
      switch (node.type) {
        case 'nested':
          return `${spacesWithoutSign}${node.name}: ${(iter(node.children, multiplier + 1))}`;
        case 'unchanged':
          return `${spacesWithoutSign}${node.name}: ${checkObj(node.value, multiplier + 1)}`;
        case 'added':
          return `${spacesWithSign}+ ${node.name}: ${checkObj(node.value, multiplier + 1)}`;
        case 'deleted':
          return `${spacesWithSign}- ${node.name}: ${checkObj(node.value, multiplier + 1)}`;
        case 'updated': {
          const from = `${spacesWithSign}- ${node.name}: ${checkObj(node.value1, multiplier + 1)}`;
          const to = `${spacesWithSign}+ ${node.name}: ${checkObj(node.value2, multiplier + 1)}`;
          return `${from}\n${to}`;
        }
        default:
          throw new Error(`Unexpected node type: ${node.type}`);
      }
    });
    return ['{', ...result, `${generateSpacesWithoutSign(multiplier - 1)}}`].join('\n');
  };
  return iter(ast, 1);
};

export default stylish;
