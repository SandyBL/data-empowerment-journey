/**
 * The "Image for the body" control in the Blog Content Studio.
 *
 * Placing a picture in an article used to mean switching the body editor from
 * Markdown to rich text, because the + button that opens the media library
 * lives on the editor toolbar and that toolbar is rendered `disabled` whenever
 * the editor is in raw Markdown mode -- it is how Decap's own RawEditor is
 * written, not something this site configured, so there is no setting that
 * turns it back on. An author who writes in Markdown therefore had to leave
 * their text, switch modes, place the image, and switch back; and the trip
 * through rich text is what rewrites the body on the way (every line becomes
 * its own paragraph, pipes come back escaped as `\|`), which is a high price
 * for one picture.
 *
 * So the upload moves off the toolbar and into a field of its own, which works
 * the same in either mode. It opens the same media library, uploads into the
 * same media_folder, and commits with the article exactly as the + button
 * does. What it does differently is hand back the finished Markdown --
 * `![alt](/assets/images/blog/file.svg "Caption")` -- on the clipboard, for
 * pasting at the cursor in the body. One keystroke, and the body is never
 * round-tripped through the rich-text serialiser.
 *
 * The field writes nothing to the article. It never calls `onChange`, so no
 * `image_insert` key is ever saved to front matter; it is a tool on the page
 * rather than a property of the entry.
 *
 * The media-library contract used below -- a per-control id, `mediaPaths`,
 * `onOpenMediaLibrary`, `onRemoveInsertedMedia`, `onRemoveMediaControl` -- is
 * the one Decap's own file and image widgets use (decap-cms-widget-file,
 * withFileControl.js). `window.h` and `window.createClass` are exposed by the
 * Decap bundle so an extension needs no build step of its own.
 */

/** Decap's media library hands back a public path; it does not touch the caption. */
const snippetFor = (path, alt, caption) => {
  // Square brackets close the alt text early and a double quote closes the
  // title early, so both are replaced rather than passed through: a caption
  // containing one would otherwise produce Markdown that renders as visible
  // punctuation soup, and the author would have no way to tell why.
  const safeAlt = alt.replace(/[[\]]/g, '').trim();
  const safeCaption = caption.replace(/"/g, '”').trim();
  const title = safeCaption ? ` "${safeCaption}"` : '';
  return `![${safeAlt}](${path}${title})`;
};

/**
 * Puts text on the clipboard, and says whether it got there.
 *
 * The async Clipboard API needs the page to be trusted and the call to be close
 * enough to a click; a selection made in the media library modal is a click,
 * but not always one the browser still counts by the time the dialog has closed
 * and React has re-rendered. The execCommand path is the fallback for exactly
 * that case, and both failing is reported rather than swallowed -- the snippet
 * is on screen and selectable, so a failed copy is an inconvenience, while a
 * copy that silently did nothing would have the author pasting whatever was on
 * the clipboard before into their article.
 */
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* falls through to the selection-based copy below */
  }

  const scratch = document.createElement('textarea');
  scratch.value = text;
  scratch.setAttribute('readonly', '');
  scratch.style.position = 'fixed';
  scratch.style.top = '-1000px';
  document.body.append(scratch);
  scratch.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    scratch.remove();
  }
};

const BUTTON = {
  padding: '8px 14px',
  marginRight: '8px',
  border: '1px solid #cfd8dc',
  borderRadius: '4px',
  background: '#fff',
  color: '#1e2a32',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const INPUT = {
  width: '100%',
  marginTop: '4px',
  padding: '8px 10px',
  border: '1px solid #cfd8dc',
  borderRadius: '4px',
  fontSize: '14px',
};

const LABEL = { display: 'block', marginTop: '12px', fontSize: '12px', fontWeight: 700, color: '#5b6b76' };

export const registerBlogWidgets = () => {
  const { CMS, createClass, h } = window;
  if (!CMS || !createClass || !h) return false;

  const ImageInsertControl = createClass({
    getInitialState() {
      // Decap keys its media-library bookkeeping by control id, so the control
      // needs one of its own before the library is opened.
      this.controlID = window.crypto?.randomUUID?.() ?? `image-insert-${Date.now()}`;
      return { path: '', alt: '', caption: '', status: '' };
    },

    /** The path the media library has recorded against this control, if any. */
    selectedPath(props) {
      return props?.mediaPaths?.get(this.controlID);
    },

    /**
     * Whether an update is worth re-rendering for -- and the reason a chosen
     * image used to leave this field looking untouched.
     *
     * Decap wraps every widget in a component that decides for itself whether
     * the control below it should re-render, and its default answer is "only
     * when `value`, `classNameWrapper` or `hasActiveStyle` changed". This field
     * deliberately never writes a value, so that answer was always no: the
     * selection reached Decap's store, the store handed a fresh `mediaPaths`
     * to the wrapper, and the wrapper dropped it. Nothing below ever heard
     * that a file had been picked.
     *
     * A control can overrule that by defining this method -- the wrapper reads
     * it off the instance and asks it instead (see `processInnerControlRef` in
     * decap-cms-core), which is how the file and image widgets get their own
     * selections through. The wrapper calls it with `nextProps` alone while
     * React calls the very same method with `(nextProps, nextState)`, so both
     * callers have to get a sound answer out of one body: hence the guard on
     * `nextState` rather than a bare comparison, without which every keystroke
     * in the alt text would look like a props-only update and be dropped.
     */
    shouldComponentUpdate(nextProps, nextState) {
      if (nextState && nextState !== this.state) return true;
      if (this.selectedPath(nextProps) !== this.selectedPath(this.props)) return true;
      return (
        nextProps.value !== this.props.value ||
        nextProps.classNameWrapper !== this.props.classNameWrapper ||
        nextProps.hasActiveStyle !== this.props.hasActiveStyle
      );
    },

    componentDidUpdate(prevProps) {
      const path = this.selectedPath(this.props);
      // Compared against the previous render rather than against the state
      // below, because only the change is the selection: an identical path
      // means this update came from typing in the fields, and an empty one is
      // the library's record being cleared just below. Reading the change also
      // keeps a second pick of the same file working, which a comparison
      // against the state would mistake for the picture already on screen.
      if (!path || path === this.selectedPath(prevProps)) return;

      // The record is cleared straight away, so choosing the same file a second
      // time arrives as a change again rather than as a repeat of what is
      // already recorded.
      this.props.onRemoveInsertedMedia(this.controlID);

      const { alt, caption } = this.state;

      // Nothing is copied yet when there is no alt text. Copying `![](path)`
      // the moment the upload lands is the version that gets pasted, because
      // it is the one already on the clipboard -- and an image with no alt text
      // is silent to anyone using a screen reader. So the upload asks for it
      // first, and copies once there is something to copy.
      if (!alt.trim()) {
        this.setState({ path, status: 'Uploaded. Add the alt text below and the Markdown is copied for you.' });
        return;
      }

      this.setState({ path, status: 'Copying…' });
      copyToClipboard(snippetFor(path, alt, caption)).then((copied) => {
        this.setState({
          status: copied
            ? 'Copied. Put the cursor on an empty line in the body and paste.'
            : 'Ready — select the Markdown below and copy it yourself.',
        });
      });
    },

    componentWillUnmount() {
      this.props.onRemoveMediaControl(this.controlID);
    },

    chooseImage(event) {
      event.preventDefault();
      this.props.onOpenMediaLibrary({
        controlID: this.controlID,
        forImage: true,
        privateUpload: false,
        value: '',
        allowMultiple: false,
        field: this.props.field,
      });
    },

    // Editing the alt text or the caption after the upload has to rebuild the
    // snippet, which is why they are state rather than read off the DOM. The
    // clipboard is refreshed as they are typed, so whatever is on it matches
    // what the field shows; without that the author edits the caption, pastes,
    // and gets the version from before the edit.
    updateField(key) {
      return (event) => {
        this.setState({ [key]: event.target.value, status: '' }, () => {
          const { path, alt, caption } = this.state;
          if (!path || !alt.trim()) return;
          copyToClipboard(snippetFor(path, alt, caption)).then((copied) => {
            if (copied) this.setState({ status: 'Copied. Put the cursor on an empty line in the body and paste.' });
          });
        });
      };
    },

    copySnippet(event) {
      event.preventDefault();
      const { path, alt, caption } = this.state;
      copyToClipboard(snippetFor(path, alt, caption)).then((copied) => {
        this.setState({
          status: copied ? 'Copied. Paste it into the body.' : 'Copying was blocked — select the Markdown below.',
        });
      });
    },

    render() {
      const { path, alt, caption, status } = this.state;
      const snippet = path ? snippetFor(path, alt, caption) : '';

      return h(
        'div',
        { className: this.props.classNameWrapper, style: { padding: '12px 14px' } },
        h(
          'button',
          { type: 'button', style: BUTTON, onClick: this.chooseImage.bind(this) },
          path ? 'Choose a different image' : 'Upload or choose an image'
        ),
        path && h('button', { type: 'button', style: BUTTON, onClick: this.copySnippet.bind(this) }, 'Copy the Markdown again'),

        path &&
          h(
            'div',
            null,
            h(
              'label',
              { style: LABEL },
              'Alt text — what a screen reader says instead of the picture',
              h('input', {
                type: 'text',
                style: INPUT,
                value: alt,
                onChange: this.updateField('alt'),
                placeholder: 'Data quality chain of accountability diagram',
              })
            ),
            h(
              'label',
              { style: LABEL },
              'Caption — printed under the picture (optional)',
              h('input', {
                type: 'text',
                style: INPUT,
                value: caption,
                onChange: this.updateField('caption'),
                placeholder: 'Who is accountable at each tier.',
              })
            ),
            h('label', { style: LABEL }, 'Markdown to paste into the body'),
            h('textarea', {
              readOnly: true,
              rows: 2,
              style: { ...INPUT, fontFamily: 'monospace', fontSize: '13px' },
              value: snippet,
              onClick: (event) => event.target.select(),
            }),
            h(
              'p',
              { style: { margin: '8px 0 0', fontSize: '12px', color: '#5b6b76' } },
              'Paste it on a line of its own, with a blank line above and below, and it publishes as a captioned figure.'
            )
          ),

        status && h('p', { style: { margin: '10px 0 0', fontSize: '12px', fontWeight: 600, color: '#0a7568' } }, status)
      );
    },
  });

  // The preview pane renders the article, and this field is not part of the
  // article, so it contributes nothing to it.
  CMS.registerWidget('image-insert', ImageInsertControl, () => null);
  return true;
};
