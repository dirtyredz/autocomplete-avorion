'use babel';

// data source is an array of objects
import enums from '../data/enums';
import functions from '../data/functions';
import objects from '../data/objects';
import inherited from '../data/inherited';
let suggestions = enums.concat(functions,objects)

class AdvancedProvider {
	constructor() {
		console.log('Constructed')
		// offer suggestions only when editing plain text or HTML files
		this.selector = '.source.lua';

		// except when editing a comment within an HTML file
		this.disableForSelector = '.source.lua .comment, .source.lua .string';

		this.inclusionPriority = 10;
		this.excludeLowerPriority = false;
		// make these suggestions appear above default suggestions
		this.suggestionPriority = 2;
	}

	getSuggestions(options) {
		console.log(options)
		const { editor, bufferPosition } = options;

		// getting the prefix on our own instead of using the one Atom provides
		let prefix = this.getPrefix(editor, bufferPosition);
		if (!prefix) { return this.findMatchingSuggestions(suggestions,''); }

		if (prefix.delim && prefix.delim.endsWith(':')) {
			let leftSuggestion = this.findMatchingSuggestions(suggestions, prefix.left)[0];

			if (!leftSuggestion) { return null }
			if (!leftSuggestion.inherited && !leftSuggestion.members) { return null }

			let combinedSuggestions = this.getCombinedMembers(leftSuggestion);

			return this.findMatchingSuggestions(combinedSuggestions, prefix.right, leftSuggestion);
		}

		if (prefix.delim && prefix.delim.endsWith('.')) {
			let leftSuggestion = this.findMatchingSuggestions(suggestions, prefix.left)[0];

			if (!leftSuggestion) { return null }
			if (!leftSuggestion.inherited && !leftSuggestion.members) { return null }

			let combinedSuggestions = this.getCombinedProperties(leftSuggestion);

			return this.findMatchingSuggestions(combinedSuggestions, prefix.right, leftSuggestion);
		}

    return this.findMatchingSuggestions(suggestions, prefix.left);
	}

	getCombinedMembers(leftSuggestion) {
		let combinedSuggestions = leftSuggestion.members || [];

		if (leftSuggestion.inherited) {
			if(Array.isArray(leftSuggestion.inherited)){
				leftSuggestion.inherited.forEach((x)=>{
					let inheritedStuff = inherited[x][0];
					if (inheritedStuff.members) { combinedSuggestions = combinedSuggestions.concat(inheritedStuff.members); }
				});
			}else{
				let inheritedStuff = inherited[leftSuggestion.inherited][0];
				if (inheritedStuff.members) { combinedSuggestions = combinedSuggestions.concat(inheritedStuff.members); }
			}
		}
		return combinedSuggestions;
	}

	getCombinedProperties(leftSuggestion) {
		let combinedSuggestions = leftSuggestion.properties || [];

		if (leftSuggestion.inherited) {
			if(Array.isArray(leftSuggestion.inherited)){
				leftSuggestion.inherited.forEach((x)=>{
					let inheritedStuff = inherited[x][0];
					if (inheritedStuff.properties) { combinedSuggestions = combinedSuggestions.concat(inheritedStuff.properties); }
				});
			}else{
				let inheritedStuff = inherited[leftSuggestion.inherited][0];
				if (inheritedStuff.properties) { combinedSuggestions = combinedSuggestions.concat(inheritedStuff.properties); }
			}
		}
		return combinedSuggestions;
	}

	getPrefix(editor, bufferPosition) {
		let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
		let match = line.match(/([a-zA-Z_][\w]*)(\.|:|\(.*\):|\(.*\)\.)?([a-zA-Z_][\w]*)?$/);

		return match ? {left: match[1], delim: match[2], right: match[3]} : '';
	}

	findMatchingSuggestions(SuggestionGroup, prefix, leftSuggestion) {
		if(!prefix){prefix = ''}
		// filter list of suggestions to those matching the prefix, case insensitive
		let prefixLower = prefix.toLowerCase();
		let matchingSuggestions = SuggestionGroup.filter((suggestion) => {
			let textLower = suggestion.text.toLowerCase();
			return textLower.startsWith(prefixLower);
		});
		// run each matching suggestion through inflateSuggestion() and return
		return matchingSuggestions.map((x)=>{return this.inflateSuggestion(x,leftSuggestion)});
	}

	// clones a suggestion object to a new object with some shared additions
	// cloning also fixes an issue where selecting a suggestion won't insert it
	inflateSuggestion(suggestion,leftSuggestion) {
		let icon = 'F';
		let snippet = suggestion.text;
		let svc = 'Server/Client';
		let type = 'method';

		if(suggestion.type){type = suggestion.type}
		if(suggestion.snippet){snippet = suggestion.snippet}
		if(suggestion.svc){svc = suggestion.svc}
		if(leftSuggestion && leftSuggestion.svc){svc = leftSuggestion.svc}
		if(suggestion.type == 'enum'){
			icon = 'E';
		}else if(suggestion.type == 'property'){
			icon = 'P';
		}
		return {
			text: suggestion.text,
			snippet: snippet,
			description: suggestion.description,
			iconHTML: icon,
			type: type,
			members: suggestion.members,
			properties: suggestion.properties,
			svc: svc,
			inherited: suggestion.inherited,
			rightLabelHTML: '<span class="aab-right-label">'+svc+'</span>' // look in /styles/atom-slds.less
		};
	}
}
export default new AdvancedProvider();
