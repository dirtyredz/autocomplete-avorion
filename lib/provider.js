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
		// all of our snippets start with "@"
		if (!prefix) { return this.findMatchingSuggestions(suggestions.global,''); }
		if ((prefix.delim == ':' || prefix.delim == '():') && !suggestions.members[prefix.left]) { return null }
		if (prefix.delim == ':' || prefix.delim == '():') { return this.findMatchingSuggestions(suggestions.members[prefix.left],prefix.right); }
    return this.findMatchingSuggestions(suggestions.global,prefix.left);
	}

	getPrefix(editor, bufferPosition) {
		// the prefix normally only includes characters back to the last word break
		// which is problematic if your suggestions include punctuation (like "@")
		// this expands the prefix back until a whitespace character is met
		// you can tweak this logic/regex to suit your needs
		let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
		let match = line.match(/([a-zA-Z_][\w]*)(\.|:|\(\):|\(\)\.)?([a-zA-Z_][\w]*)?$/);

		return match ? {left: match[1], delim: match[2], right: match[3]} : '';
	}

	findMatchingSuggestions(SuggestionGroup,prefix) {
		console.log(SuggestionGroup);
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
		return {
			displayText: suggestion.text,
			snippet: suggestion.snippet,
			description: suggestion.description,
			iconHTML: suggestion.icon,
			type: suggestion.type,
			rightLabelHTML: '<span class="aab-right-label">'+suggestion.svc+'</span>' // look in /styles/atom-slds.less
		};
	}

	onDidInsertSuggestion(options) {
		atom.notifications.addSuccess(options.suggestion.displayText + ' was inserted.');
	}
}
export default new AdvancedProvider();
