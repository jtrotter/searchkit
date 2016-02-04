import * as React from "react";
import "../styles/index.scss";

import {
	SearchkitComponent,
	PageSizeAccessor,
	ImmutableQuery,
	HighlightAccessor,
	SearchkitComponentProps,
	ReactComponentType,
	PureRender,
	SourceFilterType,
	SourceFilterAccessor
} from "../../../../core"

const map = require("lodash/map")
const defaults = require("lodash/defaults")


export interface HitItemProps {
	key:string,
	bemBlocks?:any,
	result:Object
}

@PureRender
export class HitItem extends React.Component<HitItemProps, any> {
	render(){
		return (
			<div data-qa="hit" className={this.props.bemBlocks.item().mix(this.props.bemBlocks.container("item"))}>
			</div>
		)
	}
}

export interface HitsProps extends SearchkitComponentProps{
	hitsPerPage: number
	highlightFields?:Array<string>
	sourceFilter?:SourceFilterType
	itemComponent?:ReactComponentType<HitItemProps>
	scrollTo?: string
}


export class Hits extends SearchkitComponent<HitsProps, any> {

	static propTypes = defaults({
		hitsPerPage:React.PropTypes.number.isRequired,
		highlightFields:React.PropTypes.arrayOf(
			React.PropTypes.string
		),
		sourceFilterType:React.PropTypes.oneOf([
			React.PropTypes.string,
			React.PropTypes.arrayOf(React.PropTypes.string),
			React.PropTypes.bool
		]),
		itemComponent:React.PropTypes.func
	}, SearchkitComponent.propTypes)

	static defaultProps = {
		itemComponent:HitItem,
		scrollTo: null
	}

	componentWillMount() {
		super.componentWillMount()
		if(this.props.highlightFields) {
			this.searchkit.addAccessor(
				new HighlightAccessor(this.props.highlightFields))
		}
		if(this.props.sourceFilter){
			this.searchkit.addAccessor(
				new SourceFilterAccessor(this.props.sourceFilter)
			)
		}
	}

	componentDidUpdate() {
		if(!!this.props.scrollTo && !this.isLoading() && this.hasHitsChanged()) {
			document.querySelector(this.props.scrollTo).scrollTop = 0;
		}
	}

	defineAccessor(){
		return new PageSizeAccessor(this.props.hitsPerPage)
	}

	defineBEMBlocks() {
		let block = (this.props.mod || "hits")
		return {
			container: block,
			item: `${block}-hit`
		}
	}

	renderResult(result:any) {
		return React.createElement(this.props.itemComponent, {
			key:result._id, result, bemBlocks:this.bemBlocks
		})
	}

	render() {
		let hits:Array<Object> = this.getHits()
		let hasHits = hits.length > 0

		if (!this.isInitialLoading() && hasHits) {
			return (
				<div data-qa="hits" className={this.bemBlocks.container()}>
				{map(hits, this.renderResult.bind(this))}
				</div>
			);
		}

		return null

	}
}
