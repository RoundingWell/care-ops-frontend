/* global Formio */
const NestedComponent = Formio.Components.components.nested;

class SnippetComponent extends NestedComponent {
  constructor(...args) {
    super(...args);
    this.noField = true;
  }
  static schema(...extendArgs) {
    return NestedComponent.schema({
      label: 'Snippet',
      key: 'snippet',
      type: 'snippet',
      components: [],
      input: false,
      persistent: false,
      snippet: null,
    }, ...extendArgs);
  }
}

Formio.use({
  components: {
    snippet: SnippetComponent,
  },
});
