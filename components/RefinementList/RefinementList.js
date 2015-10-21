var React = require('react');

var cx = require('classnames');

var Template = require('../Template');

var {isSpecialClick} = require('../../lib/utils.js');


class RefinementList extends React.Component {
  refine(value) {
    this.props.toggleRefinement(value);
  }

  _generateFacetItem(facetValue) {
    var subList;
    var hasChildren = facetValue.data && facetValue.data.length > 0;
    if (hasChildren) {
      subList = <RefinementList
                  {...this.props}
                  depth={this.props.depth + 1}
                  facetValues={facetValue.data}
                />;
    }
    var data = facetValue;

    if (this.props.createURL) {
      data.url = this.props.createURL(facetValue[this.props.facetNameKey]);
    }

    var templateData = {...facetValue, cssClasses: this.props.cssClasses};

    var cssClassItem = cx(this.props.cssClasses.item, {
      [this.props.cssClasses.active]: facetValue.isRefined
    });

    return (
      <div
        className={cssClassItem}
        key={facetValue[this.props.facetNameKey]}
        onClick={this.handleClick.bind(this, facetValue[this.props.facetNameKey])}
      >
        <Template data={templateData} templateKey="item" {...this.props.templateProps} />
        {subList}
      </div>
    );
  }

  // Click events on DOM tree like LABEL > INPUT will result in two click events
  // instead of one. No matter the framework: see
  // a label, you will get two click events instead of one.
  // No matter the framework, see https://www.google.com/search?q=click+label+twice
  //
  // Thus making it hard to distinguish activation from deactivation because both click events
  // are very close. Debounce is a solution but hacky.
  //
  // So the code here checks if the click was done on or in a LABEL. If this LABEL
  // has a checkbox inside, we ignore the first click event because we will get another one.
  //
  // We also check if the click was done inside a link and then e.preventDefault() because we already
  // handle the url
  //
  // Finally, we always stop propagation of the event to avoid multiple levels RefinementLists to fail: click
  // on child would click on parent also
  handleClick(value, e) {
    if (isSpecialClick(e)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }

    if (e.target.tagName === 'INPUT') {
      this.refine(value);
      return;
    }

    var parent = e.target;

    while (parent !== e.currentTarget) {
      if (parent.tagName === 'LABEL' && parent.querySelector('input[type="checkbox"]')) {
        return;
      }

      if (parent.tagName === 'A' && parent.href) {
        e.preventDefault();
      }

      parent = parent.parentNode;
    }

    e.stopPropagation();

    this.refine(value);
  }

  render() {
    // Adding `-lvl0` classes
    var cssClassList = [this.props.cssClasses.list];
    if (this.props.cssClasses.depth) {
      cssClassList.push(`${this.props.cssClasses.depth}${this.props.depth}`);
    }

    return (
      <div className={cx(cssClassList)}>
        {this.props.facetValues.map(this._generateFacetItem, this)}
      </div>
    );
  }
}

RefinementList.propTypes = {
  Template: React.PropTypes.func,
  createURL: React.PropTypes.func.isRequired,
  cssClasses: React.PropTypes.shape({
    item: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ]),
    list: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ])
  }),
  facetNameKey: React.PropTypes.string,
  facetValues: React.PropTypes.array,
  templateProps: React.PropTypes.object.isRequired,
  toggleRefinement: React.PropTypes.func.isRequired
};

RefinementList.defaultProps = {
  cssClasses: {},
  depth: 0,
  facetNameKey: 'name'
};

module.exports = RefinementList;
