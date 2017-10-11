'use babel';

// data source is an array of objects
import suggestions from '../data/suggestions';

class AdvancedProvider {
	constructor() {
		// offer suggestions only when editing plain text or HTML files
		this.selector = '.source.lua';

		// except when editing a comment within an HTML file
		this.disableForSelector = '.source.lua .comment, .source.lua .string';

		// make these suggestions appear above default suggestions
		this.suggestionPriority = 1;
	}

	getSuggestions(options) {
		const { editor, bufferPosition } = options;

		// getting the prefix on our own instead of using the one Atom provides
		let prefix = this.getPrefix(editor, bufferPosition);
		console.log(prefix)
		if (!prefix) { return this.findMatchingSuggestions(suggestions.global,''); }

		if (prefix.delim == ':' || prefix.delim == '():') {
			let leftSuggestion = this.findMatchingSuggestions(suggestions.global, prefix.left)[0];
			if (!leftSuggestion.members) { return null }
			return this.findMatchingSuggestions(leftSuggestion.members, prefix.right);
		}

		if (prefix.delim == '.' || prefix.delim == '().') {
			let leftSuggestion = this.findMatchingSuggestions(suggestions.global, prefix.left)[0];
			console.log(leftSuggestion)
			if (!leftSuggestion.properties) { return null }
			return this.findMatchingSuggestions(leftSuggestion.properties, prefix.right);
		}

    return this.findMatchingSuggestions(suggestions.global, prefix.left);
	}

	getPrefix(editor, bufferPosition) {
		let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
		let match = line.match(/([a-zA-Z_][\w]*)(\.|:|\(\):|\(\)\.)?([a-zA-Z_][\w]*)?$/);

		return match ? {left: match[1], delim: match[2], right: match[3]} : '';
	}

	findMatchingSuggestions(SuggestionGroup,prefix) {
		if(!prefix){prefix = ''}
		// filter list of suggestions to those matching the prefix, case insensitive
		let prefixLower = prefix.toLowerCase();
		let matchingSuggestions = SuggestionGroup.filter((suggestion) => {
			let textLower = suggestion.text.toLowerCase();
			return textLower.startsWith(prefixLower);
		});
		// run each matching suggestion through inflateSuggestion() and return
		return matchingSuggestions.map(this.inflateSuggestion);
	}

	// clones a suggestion object to a new object with some shared additions
	// cloning also fixes an issue where selecting a suggestion won't insert it
	inflateSuggestion(suggestion) {
		let icon = 'F';
		let snippet = suggestion.text;
		let svc = 'Server/Client';
		let type = 'method';

		if(suggestion.type){type = suggestion.type}
		if(suggestion.snippet){snippet = suggestion.snippet}
		if(suggestion.svc){svc = suggestion.svc}
		if(suggestion.type == 'enum'){
			icon = 'E';
		}else if(suggestion.type == 'property'){
			icon = 'P';
		}
		return {
			displayText: suggestion.text,
			snippet: snippet,
			description: suggestion.description,
			iconHTML: icon,
			type: type,
			members: suggestion.members,
			properties: suggestion.properties,
			rightLabelHTML: '<span class="aab-right-label">'+svc+'</span>' // look in /styles/atom-slds.less
		};
	}
}
export default new AdvancedProvider();
