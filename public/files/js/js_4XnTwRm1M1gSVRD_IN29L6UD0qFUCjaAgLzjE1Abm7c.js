
/**
 * @file: Popup dialog interfaces for the media project.
 *
 * Drupal.media.popups.mediaBrowser
 *   Launches the media browser which allows users to pick a piece of media.
 *
 * Drupal.media.popups.mediaStyleSelector
 *  Launches the style selection form where the user can choose
 *  what format / style they want their media in.
 *
 */

(function ($) {
namespace('Drupal.media.popups');

/**
 * Media browser popup. Creates a media browser dialog.
 *
 * @param {function}
 *          onSelect Callback for when dialog is closed, received (Array
 *          media, Object extra);
 * @param {Object}
 *          globalOptions Global options that will get passed upon initialization of the browser.
 *          @see Drupal.media.popups.mediaBrowser.getDefaults();
 *
 * @param {Object}
 *          pluginOptions Options for specific plugins. These are passed
 *          to the plugin upon initialization.  If a function is passed here as
 *          a callback, it is obviously not passed, but is accessible to the plugin
 *          in Drupal.settings.variables.
 *
 *          Example
 *          pluginOptions = {library: {url_include_patterns:'/foo/bar'}};
 *
 * @param {Object}
 *          widgetOptions Options controlling the appearance and behavior of the
 *          modal dialog.
 *          @see Drupal.media.popups.mediaBrowser.getDefaults();
 */
Drupal.media.popups.mediaBrowser = function (onSelect, globalOptions, pluginOptions, widgetOptions) {
  var options = Drupal.media.popups.mediaBrowser.getDefaults();
  options.global = $.extend({}, options.global, globalOptions);
  options.plugins = pluginOptions;
  options.widget = $.extend({}, options.widget, widgetOptions);

  // Create it as a modal window.
  var browserSrc = options.widget.src;
  if ($.isArray(browserSrc) && browserSrc.length) {
    browserSrc = browserSrc[browserSrc.length - 1];
  }
  // Params to send along to the iframe.  WIP.
  var params = {};
  $.extend(params, options.global);
  params.plugins = options.plugins;

  browserSrc += '&' + $.param(params);
  var mediaIframe = Drupal.media.popups.getPopupIframe(browserSrc, 'mediaBrowser');
  // Attach the onLoad event
  mediaIframe.bind('load', options, options.widget.onLoad);

  /**
   * Setting up the modal dialog
   */
  var ok = 'OK';
  var notSelected = 'You have not selected anything!';

  if (Drupal && Drupal.t) {
    ok = Drupal.t(ok);
    notSelected = Drupal.t(notSelected);
  }

  // @todo: let some options come through here. Currently can't be changed.
  var dialogOptions = options.dialog;

  dialogOptions.buttons[ok] = function () {
    var selected = this.contentWindow.Drupal.media.browser.selectedMedia;
    if (selected.length < 1) {
      alert(notSelected);
      return;
    }
    onSelect(selected);
    $(this).dialog("close");
  };

  var dialog = mediaIframe.dialog(dialogOptions);

  Drupal.media.popups.sizeDialog(dialog);
  Drupal.media.popups.resizeDialog(dialog);
  Drupal.media.popups.scrollDialog(dialog);
  Drupal.media.popups.overlayDisplace(dialog.parents(".ui-dialog"));

  return mediaIframe;
};

Drupal.media.popups.mediaBrowser.mediaBrowserOnLoad = function (e) {
  var options = e.data;
  if (this.contentWindow.Drupal.media == undefined) return;

  if (this.contentWindow.Drupal.media.browser.selectedMedia.length > 0) {
    var ok = (Drupal && Drupal.t) ? Drupal.t('OK') : 'OK';
    var ok_func = $(this).dialog('option', 'buttons')[ok];
    ok_func.call(this);
    return;
  }
};

Drupal.media.popups.mediaBrowser.getDefaults = function () {
  return {
    global: {
      types: [], // Types to allow, defaults to all.
      activePlugins: [] // If provided, a list of plugins which should be enabled.
    },
    widget: { // Settings for the actual iFrame which is launched.
      src: Drupal.settings.media.browserUrl, // Src of the media browser (if you want to totally override it)
      onLoad: Drupal.media.popups.mediaBrowser.mediaBrowserOnLoad // Onload function when iFrame loads.
    },
    dialog: Drupal.media.popups.getDialogOptions()
  };
};

Drupal.media.popups.mediaBrowser.finalizeSelection = function () {
  var selected = this.contentWindow.Drupal.media.browser.selectedMedia;
  if (selected.length < 1) {
    alert(notSelected);
    return;
  }
  onSelect(selected);
  $(this).dialog("close");
}

/**
 * Style chooser Popup. Creates a dialog for a user to choose a media style.
 *
 * @param mediaFile
 *          The mediaFile you are requesting this formatting form for.
 *          @todo: should this be fid?  That's actually all we need now.
 *
 * @param Function
 *          onSubmit Function to be called when the user chooses a media
 *          style. Takes one parameter (Object formattedMedia).
 *
 * @param Object
 *          options Options for the mediaStyleChooser dialog.
 */
Drupal.media.popups.mediaStyleSelector = function (mediaFile, onSelect, options) {
  var defaults = Drupal.media.popups.mediaStyleSelector.getDefaults();
  // @todo: remove this awful hack :(
  if (typeof defaults.src === 'string' ) {
    defaults.src = defaults.src.replace('-media_id-', mediaFile.fid) + '&fields=' + encodeURIComponent(JSON.stringify(mediaFile.fields));
  }
  else {
    var src = defaults.src.shift();
    defaults.src.unshift(src);
    defaults.src = src.replace('-media_id-', mediaFile.fid) + '&fields=' + encodeURIComponent(JSON.stringify(mediaFile.fields));
  }
  options = $.extend({}, defaults, options);
  // Create it as a modal window.
  var mediaIframe = Drupal.media.popups.getPopupIframe(options.src, 'mediaStyleSelector');
  // Attach the onLoad event
  mediaIframe.bind('load', options, options.onLoad);

  /**
   * Set up the button text
   */
  var ok = 'OK';
  var notSelected = 'Very sorry, there was an unknown error embedding media.';

  if (Drupal && Drupal.t) {
    ok = Drupal.t(ok);
    notSelected = Drupal.t(notSelected);
  }

  // @todo: let some options come through here. Currently can't be changed.
  var dialogOptions = Drupal.media.popups.getDialogOptions();

  dialogOptions.buttons[ok] = function () {

    var formattedMedia = this.contentWindow.Drupal.media.formatForm.getFormattedMedia();
    if (!formattedMedia) {
      alert(notSelected);
      return;
    }
    onSelect(formattedMedia);
    $(this).dialog("close");
  };

  var dialog = mediaIframe.dialog(dialogOptions);

  Drupal.media.popups.sizeDialog(dialog);
  Drupal.media.popups.resizeDialog(dialog);
  Drupal.media.popups.scrollDialog(dialog);
  Drupal.media.popups.overlayDisplace(dialog.parents(".ui-dialog"));

  return mediaIframe;
};

Drupal.media.popups.mediaStyleSelector.mediaBrowserOnLoad = function (e) {
};

Drupal.media.popups.mediaStyleSelector.getDefaults = function () {
  return {
    src: Drupal.settings.media.styleSelectorUrl,
    onLoad: Drupal.media.popups.mediaStyleSelector.mediaBrowserOnLoad
  };
};


/**
 * Style chooser Popup. Creates a dialog for a user to choose a media style.
 *
 * @param mediaFile
 *          The mediaFile you are requesting this formatting form for.
 *          @todo: should this be fid?  That's actually all we need now.
 *
 * @param Function
 *          onSubmit Function to be called when the user chooses a media
 *          style. Takes one parameter (Object formattedMedia).
 *
 * @param Object
 *          options Options for the mediaStyleChooser dialog.
 */
Drupal.media.popups.mediaFieldEditor = function (fid, onSelect, options) {
  var defaults = Drupal.media.popups.mediaFieldEditor.getDefaults();
  // @todo: remove this awful hack :(
  defaults.src = defaults.src.replace('-media_id-', fid);
  options = $.extend({}, defaults, options);
  // Create it as a modal window.
  var mediaIframe = Drupal.media.popups.getPopupIframe(options.src, 'mediaFieldEditor');
  // Attach the onLoad event
  // @TODO - This event is firing too early in IE on Windows 7,
  // - so the height being calculated is too short for the content.
  mediaIframe.bind('load', options, options.onLoad);

  /**
   * Set up the button text
   */
  var ok = 'OK';
  var notSelected = 'Very sorry, there was an unknown error embedding media.';

  if (Drupal && Drupal.t) {
    ok = Drupal.t(ok);
    notSelected = Drupal.t(notSelected);
  }

  // @todo: let some options come through here. Currently can't be changed.
  var dialogOptions = Drupal.media.popups.getDialogOptions();

  dialogOptions.buttons[ok] = function () {
    var formattedMedia = this.contentWindow.Drupal.media.formatForm.getFormattedMedia();
    if (!formattedMedia) {
      alert(notSelected);
      return;
    }
    onSelect(formattedMedia);
    $(this).dialog("close");
  };

  var dialog = mediaIframe.dialog(dialogOptions);

  Drupal.media.popups.sizeDialog(dialog);
  Drupal.media.popups.resizeDialog(dialog);
  Drupal.media.popups.scrollDialog(dialog);
  Drupal.media.popups.overlayDisplace(dialog);

  return mediaIframe;
};

Drupal.media.popups.mediaFieldEditor.mediaBrowserOnLoad = function (e) {

};

Drupal.media.popups.mediaFieldEditor.getDefaults = function () {
  return {
    // @todo: do this for real
    src: '/media/-media_id-/edit?render=media-popup',
    onLoad: Drupal.media.popups.mediaFieldEditor.mediaBrowserOnLoad
  };
};


/**
 * Generic functions to both the media-browser and style selector
 */

/**
 * Returns the commonly used options for the dialog.
 */
Drupal.media.popups.getDialogOptions = function () {
  return {
    buttons: {},
    dialogClass: Drupal.settings.media.dialogOptions.dialogclass,
    modal: Drupal.settings.media.dialogOptions.modal,
    draggable: Drupal.settings.media.dialogOptions.draggable,
    resizable: Drupal.settings.media.dialogOptions.resizable,
    minWidth: Drupal.settings.media.dialogOptions.minwidth,
    width: Drupal.settings.media.dialogOptions.width,
    height: Drupal.settings.media.dialogOptions.height,
    position: Drupal.settings.media.dialogOptions.position,
    overlay: {
      backgroundColor: Drupal.settings.media.dialogOptions.overlay.backgroundcolor,
      opacity: Drupal.settings.media.dialogOptions.overlay.opacity
    },
    zIndex: Drupal.settings.media.dialogOptions.zindex,
    close: function (event, ui) {
      $(event.target).remove();
    }
  };
};

/**
 * Get an iframe to serve as the dialog's contents. Common to both plugins.
 */
Drupal.media.popups.getPopupIframe = function (src, id, options) {
  var defaults = {width: '100%', scrolling: 'auto'};
  var options = $.extend({}, defaults, options);

  return $('<iframe class="media-modal-frame"/>')
  .attr('src', src)
  .attr('width', options.width)
  .attr('id', id)
  .attr('scrolling', options.scrolling);
};

Drupal.media.popups.overlayDisplace = function (dialog) {
  if (parent.window.Drupal.overlay && jQuery.isFunction(parent.window.Drupal.overlay.getDisplacement)) {
    var overlayDisplace = parent.window.Drupal.overlay.getDisplacement('top');
    if (dialog.offset().top < overlayDisplace) {
      dialog.css('top', overlayDisplace);
    }
  }
}

/**
 * Size the dialog when it is first loaded and keep it centered when scrolling.
 *
 * @param jQuery dialogElement
 *  The element which has .dialog() attached to it.
 */
Drupal.media.popups.sizeDialog = function (dialogElement) {
  if (!dialogElement.is(':visible')) {
    return;
  }
  var windowWidth = $(window).width();
  var dialogWidth = windowWidth * 0.8;
  var windowHeight = $(window).height();
  var dialogHeight = windowHeight * 0.8;

  dialogElement.dialog("option", "width", dialogWidth);
  dialogElement.dialog("option", "height", dialogHeight);
  dialogElement.dialog("option", "position", 'center');

  $('.media-modal-frame').width('100%');
}

/**
 * Resize the dialog when the window changes.
 *
 * @param jQuery dialogElement
 *  The element which has .dialog() attached to it.
 */
Drupal.media.popups.resizeDialog = function (dialogElement) {
  $(window).resize(function() {
    Drupal.media.popups.sizeDialog(dialogElement);
  });
}

/**
 * Keeps the dialog centered when the window is scrolled.
 *
 * @param jQuery dialogElement
 *  The element which has .dialog() attached to it.
 */
Drupal.media.popups.scrollDialog = function (dialogElement) {
  // Keep the dialog window centered when scrolling.
  $(window).scroll(function() {
    if (!dialogElement.is(':visible')) {
      return;
    }
    dialogElement.dialog("option", "position", 'center');
  });
}

})(jQuery);
;
(function ($) {

/**
 * Toggle the visibility of a fieldset using smooth animations.
 */
Drupal.toggleFieldset = function (fieldset) {
  var $fieldset = $(fieldset);
  if ($fieldset.is('.collapsed')) {
    var $content = $('> .fieldset-wrapper', fieldset).hide();
    $fieldset
      .removeClass('collapsed')
      .trigger({ type: 'collapsed', value: false })
      .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Hide'));
    $content.slideDown({
      duration: 'fast',
      easing: 'linear',
      complete: function () {
        Drupal.collapseScrollIntoView(fieldset);
        fieldset.animating = false;
      },
      step: function () {
        // Scroll the fieldset into view.
        Drupal.collapseScrollIntoView(fieldset);
      }
    });
  }
  else {
    $fieldset.trigger({ type: 'collapsed', value: true });
    $('> .fieldset-wrapper', fieldset).slideUp('fast', function () {
      $fieldset
        .addClass('collapsed')
        .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Show'));
      fieldset.animating = false;
    });
  }
};

/**
 * Scroll a given fieldset into view as much as possible.
 */
Drupal.collapseScrollIntoView = function (node) {
  var h = document.documentElement.clientHeight || document.body.clientHeight || 0;
  var offset = document.documentElement.scrollTop || document.body.scrollTop || 0;
  var posY = $(node).offset().top;
  var fudge = 55;
  if (posY + node.offsetHeight + fudge > h + offset) {
    if (node.offsetHeight > h) {
      window.scrollTo(0, posY);
    }
    else {
      window.scrollTo(0, posY + node.offsetHeight - h + fudge);
    }
  }
};

Drupal.behaviors.collapse = {
  attach: function (context, settings) {
    $('fieldset.collapsible', context).once('collapse', function () {
      var $fieldset = $(this);
      // Expand fieldset if there are errors inside, or if it contains an
      // element that is targeted by the URI fragment identifier.
      var anchor = location.hash && location.hash != '#' ? ', ' + location.hash : '';
      if ($fieldset.find('.error' + anchor).length) {
        $fieldset.removeClass('collapsed');
      }

      var summary = $('<span class="summary"></span>');
      $fieldset.
        bind('summaryUpdated', function () {
          var text = $.trim($fieldset.drupalGetSummary());
          summary.html(text ? ' (' + text + ')' : '');
        })
        .trigger('summaryUpdated');

      // Turn the legend into a clickable link, but retain span.fieldset-legend
      // for CSS positioning.
      var $legend = $('> legend .fieldset-legend', this);

      $('<span class="fieldset-legend-prefix element-invisible"></span>')
        .append($fieldset.hasClass('collapsed') ? Drupal.t('Show') : Drupal.t('Hide'))
        .prependTo($legend)
        .after(' ');

      // .wrapInner() does not retain bound events.
      var $link = $('<a class="fieldset-title" href="#"></a>')
        .prepend($legend.contents())
        .appendTo($legend)
        .click(function () {
          var fieldset = $fieldset.get(0);
          // Don't animate multiple times.
          if (!fieldset.animating) {
            fieldset.animating = true;
            Drupal.toggleFieldset(fieldset);
          }
          return false;
        });

      $legend.append(summary);
    });
  }
};

})(jQuery);
;
/**
 * @file
 * Linkit dialog functions
 */

// Create the linkit namespaces.
Drupal.linkit = Drupal.linkit || {};
Drupal.linkit.editorDialog = Drupal.linkit.editorDialog || {};
Drupal.linkit.insertPlugins = Drupal.linkit.insertPlugins || {};

(function ($) {

Drupal.behaviors.linkit = {
  attach: function(context, settings) {

    if ($('#linkit-modal #edit-linkit-search', context).length == 0) {
      return;
    }

    Drupal.linkit.$searchInput = $('#linkit-modal #edit-linkit-search', context);

    // Create a "Better Autocomplete" object, see betterautocomplete.js
    Drupal.linkit.$searchInput.betterAutocomplete('init',
      settings.linkit.autocompletePath,
      settings.linkit.autocomplete,
      { // Callbacks
      select: function(result) {
        // Only change the link text if it is empty
        if (typeof result.disabled != 'undefined' && result.disabled) {
          return false;
        }

        Drupal.linkit.dialog.populateFields({
          path: result.path
        });

        // Store the result title (Used when no selection is made bythe user).
        Drupal.linkitCache.link_tmp_title = result.title;

       $('#linkit-modal #edit-linkit-path').focus();
      },
      constructURL: function(path, search) {
        return path + encodeURIComponent(search);
      },
      insertSuggestionList: function($results, $input) {
        $results.width($input.outerWidth() - 2) // Subtract border width.
          .css({
            position: 'absolute',
            left: $input.offset().left,
            top: $input.offset().top + $input.outerHeight(),
            // High value because of other overlays like
            // wysiwyg fullscreen mode.
            zIndex: 211000,
            maxHeight: '330px',
            // Visually indicate that results are in the topmost layer
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
          })
          .hide()
          .insertAfter($('#linkit-modal', context).parent());
        }
    });

    $('#linkit-modal .form-text.required', context).bind({
      keyup: Drupal.linkit.dialog.requiredFieldsValidation,
      change: Drupal.linkit.dialog.requiredFieldsValidation});

    Drupal.linkit.dialog.requiredFieldsValidation();

    if (settings.linkit.IMCEurl) {
      var $imceButton = $('<input />')
        .attr({type: 'button', id: 'linkit-imce', name: 'linkit-imce'})
        .addClass('form-submit')
        .val(Drupal.t('Open file browser'))
        .insertAfter($('#linkit-modal .form-item-linkit-search'))
        .click(function() {
          Drupal.linkit.dialog.openFileBrowser();
          return false;
        });
    }
  }
};

// Create the linkitCache variable.
Drupal.linkitCache = {};

/**
 * Set the editor object.
 */
Drupal.linkit.setEditor = function (editor) {
  Drupal.linkitCache.editor = editor;
};

/**
 * Set the editor name (ckeidor or tinymce).
 */
Drupal.linkit.setEditorName = function (editorname) {
  Drupal.linkitCache.editorName = editorname;
};

/**
 * Set the name of the field that has triggerd Linkit.
 */
Drupal.linkit.setEditorField = function (editorfield) {
  Drupal.linkitCache.editorField = editorfield;
};

/**
 * Set the current selection object.
 */
Drupal.linkit.setEditorSelection = function (selection) {
  Drupal.linkitCache.selection = selection;
};

/**
 * Set the selected element based on the selection.
 */
Drupal.linkit.setEditorSelectedElement = function (element) {
  Drupal.linkitCache.selectedElement = element;
};

/**
 * Get the linkitSelection object.
 */
Drupal.linkit.getLinkitCache = function () {
  return Drupal.linkitCache;
};


Drupal.linkit.addInsertPlugin = function(name, plugin) {
  Drupal.linkit.insertPlugins[name] = plugin;
}

Drupal.linkit.getInsertPlugin = function(name) {
  return Drupal.linkit.insertPlugins[name];
}

})(jQuery);
;
/**
 * @file
 * Linkit dialog functions
 */

// Create the linkit dialog namespace.
Drupal.linkit.dialog = Drupal.linkit.dialog || {};

(function($) {

/**
 * Dialog default options.
 */
Drupal.linkit.dialog.dialogOptions = function() {
  return {
    dialogClass: 'linkit-wrapper',
    modal: true,
    draggable: false,
    resizable: false,
    width: 520,
    position: 'center',
    overlay: {
      backgroundColor: '#000000',
      opacity: 0.4
    },
    zIndex : 210000,
    close: Drupal.linkit.dialog.close
  };
};

/**
 * jQuery dialog buttons is located outside the IFRAME where Linkit dashboard
 * is shown and they cant trigger events in the IFRAME.
 * Our own buttons for inserting a link and cancel is inside that IFRAME and
 * can't destroy the dialog, so we have to bind our buttons to the dialog button.
 */
Drupal.behaviors.linkitDialogButtons = {
  attach: function (context, settings) {
    $('#linkit-modal #linkit-dashboard-form', context).submit(function() {
      var linkitCache = Drupal.linkit.getLinkitCache();
      // Call the insertLink() function.
      Drupal.linkit.editorDialog[linkitCache.editorName].insertLink(Drupal.linkit.dialog.getLink());
      // Close the dialog.
      Drupal.linkit.dialog.close();
      return false;
    });

    $('#linkit-modal #linkit-cancel', context).bind('click', Drupal.linkit.dialog.close);
  }
};

/**
 * Close the Linkit dialog.
 * Return false so the default browser behavior will not submit the form in the
 * dialog.
 */
Drupal.linkit.dialog.close = function () {
  if (Drupal.linkit.$searchInput) {
    Drupal.linkit.$searchInput.betterAutocomplete('destroy');
  }
  $('#linkit-modal').dialog('destroy').remove();

  // Unset the linkit cache.
  Drupal.linkitCache = {};
  return false;
};

/**
 * Populate fields on the dashboard. Typically this method is called from
 * an editor JS file when the dashboard page has just loaded.
 *
 * @param link
 *   An object with the following properties (all are optional):
 *   - path: The anchor's href
 *   - text: The text that should be linked. Has no effect if already set.
 *   - attributes: An object with additional attributes for the anchor element
 */
Drupal.linkit.dialog.populateFields = function(link) {
  link = link || {};
  link.attributes = link.attributes || {};
  $('#linkit-modal #edit-linkit-path').val(link.path);
  $.each(link.attributes, function(name, value) {
    $('#linkit-modal #edit-linkit-attributes #edit-linkit-' + name).val(value);
  });
  Drupal.linkit.dialog.requiredFieldsValidation();
};

/**
 * Check for mandatory text fields in the form and disable for submissions
 * if any of the fields are empty.
 */
Drupal.linkit.dialog.requiredFieldsValidation = function() {
  var allowed = true;
  $('#linkit-modal .form-text.required').each(function() {
    if (!$(this).val()) {
      allowed = false;
      return false;
    }
  });
  if (allowed) {
    $('#linkit-modal #edit-linkit-insert')
      .removeAttr('disabled')
      .removeClass('form-button-disabled');
  }
  else {
    $('#linkit-modal #edit-linkit-insert')
      .attr('disabled', 'disabled')
      .addClass('form-button-disabled');
  }
};

/**
 * Retrieve a list of the currently available additional attributes in the
 * dashboard. The attribute "href" is excluded.
 *
 * @return
 *   An array with the names of the attributes.
 */
Drupal.linkit.dialog.additionalAttributes = function() {
  var attributes = [];
  $('#linkit-modal #edit-linkit-attributes .linkit-attribute').each(function() {
    // Remove the 'linkit_' prefix.
    attributes.push($(this).attr('name').substr(7));
  });
  return attributes;
};

/**
 * Retrieve a link object by extracting values from the form.
 *
 * @return
 *   The link object.
 *
 * @see Drupal.linkit.dialog.populateFields.
 */
  Drupal.linkit.dialog.getLink = function() {
    var link = {
      path: $('#linkit-modal #edit-linkit-path').val(),
      attributes: {}
    };
    $.each(Drupal.linkit.dialog.additionalAttributes(), function(f, name) {
     link.attributes[name] =
         $('#linkit-modal #edit-linkit-attributes #edit-linkit-' + name).val();
    });
  return link;
};

/**
 * Open the IMCE file browser
 */
Drupal.linkit.dialog.openFileBrowser = function () {
  window.open(decodeURIComponent(Drupal.settings.linkit.IMCEurl), '', 'width=760,height=560,resizable=1');
};

/**
 * When a file is inserted through IMCE, this function is called
 * See IMCE api for details
 *
 * @param file
 *   The file object that was selected inside IMCE
 * @param win
 *   The IMCE window object
 */
Drupal.linkit.dialog.IMCECallback = function(file, win) {
  Drupal.linkit.dialog.populateFields({
     path: win.imce.decode(Drupal.settings.basePath +
         Drupal.settings.linkit.publicFilesDirectory +
         '/' + file.relpath)
  });
  win.close();
};

/**
 * Return the Iframe that we use in the dialog.
 */
Drupal.linkit.dialog.createDialog = function(src) {
  var linkitCache = Drupal.linkit.getLinkitCache(),
    $linkitModal = $('<div />').attr('id', 'linkit-modal');


  // Initialize Linkit editor js.
  if (typeof Drupal.linkit.editorDialog[linkitCache.editorName] !== 'undefined' &&
    typeof Drupal.linkit.editorDialog[linkitCache.editorName].init !== 'undefined') {
    Drupal.linkit.editorDialog[linkitCache.editorName].init();
  }

  // Create a dialog dig in the <body>.
  $('body').append($linkitModal);

  $.ajax({
    url : src,
    beforeSend : function() {
      // Add new throbber
      var throbber = $('<div class="ajax-progress ajax-progress-throbber"><div class="throbber">&nbsp;</div></div>');
      $linkitModal.append(throbber);
    },
    success : function(data) {
      // Insert the respons.
      $linkitModal.append(data);
      // Delete exsisting throbbers.
      $('.ajax-progress-throbber', $linkitModal).remove();

      var linkitCache = Drupal.linkit.getLinkitCache();

      // Run all the behaviors again for this new context.
      Drupal.attachBehaviors($('.linkit-wrapper'), Drupal.settings);

      // Run the afterInit function.
      if (typeof Drupal.linkit.editorDialog[linkitCache.editorName] !== 'undefined' &&
         typeof Drupal.linkit.editorDialog[linkitCache.editorName].afterInit !== 'undefined') {
        Drupal.linkit.editorDialog[linkitCache.editorName].afterInit();
      }

      // Set focus in the search field.
      $('.linkit-wrapper #edit-linkit-search').focus();

    }
  });

  return $linkitModal;
};

/**
 * Build the dialog
 *
 * @param url
 *   The url to call in the iframe.
 */
Drupal.linkit.dialog.buildDialog = function (url) {
   // Build the dialog element.
   Drupal.linkit.dialog.createDialog(url)
     // Create jQuery UI Dialog
     .dialog(Drupal.linkit.dialog.dialogOptions())
     // Remove the title bar from the dialog.
     .siblings(".ui-dialog-titlebar").remove();
};

})(jQuery);;
/**
 * @file
 * Linkit ckeditor dialog helper.
 */

Drupal.linkit.editorDialog.ckeditor = {};

(function ($) {

Drupal.linkit.editorDialog.ckeditor = {
  init : function() {},

  /**
   * Prepare the dialog after init.
   */
  afterInit : function () {
    var linkitCache = Drupal.linkit.getLinkitCache();

    // If we have selected a link element, lets populate the fields in the
    // dialog with the values from that link element.
    if (linkitCache.selectedElement) {
      link = {
        path: (linkitCache.selectedElement  && (linkitCache.selectedElement.data('cke-saved-href') || linkitCache.selectedElement.getAttribute('href'))) || '',
        attributes: {}
      },
      // Get all attributes that have fields in the dialog.
      additionalAttributes = Drupal.linkit.dialog.additionalAttributes();

      for (var i = 0; i < additionalAttributes.length; i++) {
        link.attributes[additionalAttributes[i]] =
        linkitCache.selectedElement.getAttribute(additionalAttributes[i]);
      };

      // Populate the fields.
      Drupal.linkit.dialog.populateFields(link);
    }
  },

  /**
   * Insert the link into the editor.
   *
   * @param {Object} link
   *   The link object.
   */
  insertLink : function(link) {
    var linkitCache = Drupal.linkit.getLinkitCache();
    CKEDITOR.tools.callFunction(linkitCache.editor._.linkitFnNum, link, linkitCache.editor);
  }
};

})(jQuery);;
(function ($) {

Drupal.behaviors.textarea = {
  attach: function (context, settings) {
    $('.form-textarea-wrapper.resizable', context).once('textarea', function () {
      var staticOffset = null;
      var textarea = $(this).addClass('resizable-textarea').find('textarea');
      var grippie = $('<div class="grippie"></div>').mousedown(startDrag);

      grippie.insertAfter(textarea);

      function startDrag(e) {
        staticOffset = textarea.height() - e.pageY;
        textarea.css('opacity', 0.25);
        $(document).mousemove(performDrag).mouseup(endDrag);
        return false;
      }

      function performDrag(e) {
        textarea.height(Math.max(32, staticOffset + e.pageY) + 'px');
        return false;
      }

      function endDrag(e) {
        $(document).unbind('mousemove', performDrag).unbind('mouseup', endDrag);
        textarea.css('opacity', 1);
      }
    });
  }
};

})(jQuery);
;
(function ($) {

/**
 * Automatically display the guidelines of the selected text format.
 */
Drupal.behaviors.filterGuidelines = {
  attach: function (context) {
    $('.filter-guidelines', context).once('filter-guidelines')
      .find(':header').hide()
      .closest('.filter-wrapper').find('select.filter-list')
      .bind('change', function () {
        $(this).closest('.filter-wrapper')
          .find('.filter-guidelines-item').hide()
          .siblings('.filter-guidelines-' + this.value).show();
      })
      .change();
  }
};

})(jQuery);
;
(function ($) {

/**
 * Webform node form interface enhancments.
 */

Drupal.behaviors.webformAdmin = {};
Drupal.behaviors.webformAdmin.attach = function(context) {
  // Apply special behaviors to fields with default values.
  Drupal.webform.defaultValues(context);
  // On click or change, make a parent radio button selected.
  Drupal.webform.setActive(context);
  // Update the template select list upon changing a template.
  Drupal.webform.updateTemplate(context);
  // Select all link for file extensions.
  Drupal.webform.selectCheckboxesLink(context);
  // Enhance the normal tableselect.js file to support indentations.
  Drupal.webform.tableSelectIndentation(context);
}

Drupal.webform = Drupal.webform || {};

Drupal.webform.defaultValues = function(context) {
  var $fields = $('.webform-default-value:not(.error)', context);
  var $forms = $fields.parents('form:first');
  $fields.each(function() {
    this.defaultValue = $(this).attr('rel');
    if (this.value != this.defaultValue) {
      $(this).removeClass('webform-default-value');
    }
    $(this).focus(function() {
      if (this.value == this.defaultValue) {
        this.value = '';
        $(this).removeClass('webform-default-value');
      }
    });
    $(this).blur(function() {
      if (this.value == '') {
        $(this).addClass('webform-default-value');
        this.value = this.defaultValue;
      }
    });
  });

  // Clear all the form elements before submission.
  $forms.submit(function() {
    $fields.focus();
  });
};

Drupal.webform.setActive = function(context) {
  var setActive = function(e) {
    $('.form-radio', $(this).parent().parent()).attr('checked', true);
    e.preventDefault();
  };
  $('.webform-set-active', context).click(setActive).change(setActive);
};

Drupal.webform.updateTemplate = function(context) {
  var defaultTemplate = $('#edit-templates-default').val();
  var $templateSelect = $('#webform-template-fieldset select#edit-template-option', context);
  var $templateTextarea = $('#webform-template-fieldset textarea:visible', context);

  var updateTemplateSelect = function() {
    if ($(this).val() == defaultTemplate) {
      $templateSelect.val('default');
    }
    else {
      $templateSelect.val('custom');
    }
  }

  var updateTemplateText = function() {
    if ($(this).val() == 'default' && $templateTextarea.val() != defaultTemplate) {
      if (confirm(Drupal.settings.webform.revertConfirm)) {
        $templateTextarea.val(defaultTemplate);
      }
      else {
        $(this).val('custom');
      }
    }
  }

  $templateTextarea.keyup(updateTemplateSelect);
  $templateSelect.change(updateTemplateText);
}

Drupal.webform.selectCheckboxesLink = function(context) {
  function selectCheckboxes() {
    var group = this.className.replace(/.*?webform-select-link-([^ ]*).*/, '$1');
    var $checkboxes = $('.webform-select-group-' + group + ' input[type=checkbox]');
    var reverseCheck = !$checkboxes[0].checked;
    $checkboxes.each(function() {
      this.checked = reverseCheck;
    });
    $checkboxes.trigger('change');
    return false;
  }
  $('a.webform-select-link', context).click(selectCheckboxes);
}

Drupal.webform.tableSelectIndentation = function(context) {
  var $tables = $('th.select-all', context).parents('table');
  $tables.find('input.form-checkbox').change(function() {
    var $rows = $(this).parents('table:first').find('tr');
    var row = $(this).parents('tr:first').get(0);
    var rowNumber = $rows.index(row);
    var rowTotal = $rows.size();
    var indentLevel = $(row).find('div.indentation').size();
    for (var n = rowNumber + 1; n < rowTotal; n++) {
      if ($rows.eq(n).find('div.indentation').size() <= indentLevel) {
        break;
      }
      $rows.eq(n).find('input.form-checkbox').attr('checked', this.checked);
    }
  });
}

})(jQuery);
;
(function ($) {

Drupal.toolbar = Drupal.toolbar || {};

/**
 * Attach toggling behavior and notify the overlay of the toolbar.
 */
Drupal.behaviors.toolbar = {
  attach: function(context) {

    // Set the initial state of the toolbar.
    $('#toolbar', context).once('toolbar', Drupal.toolbar.init);

    // Toggling toolbar drawer.
    $('#toolbar a.toggle', context).once('toolbar-toggle').click(function(e) {
      Drupal.toolbar.toggle();
      // Allow resize event handlers to recalculate sizes/positions.
      $(window).triggerHandler('resize');
      return false;
    });
  }
};

/**
 * Retrieve last saved cookie settings and set up the initial toolbar state.
 */
Drupal.toolbar.init = function() {
  // Retrieve the collapsed status from a stored cookie.
  var collapsed = $.cookie('Drupal.toolbar.collapsed');

  // Expand or collapse the toolbar based on the cookie value.
  if (collapsed == 1) {
    Drupal.toolbar.collapse();
  }
  else {
    Drupal.toolbar.expand();
  }
};

/**
 * Collapse the toolbar.
 */
Drupal.toolbar.collapse = function() {
  var toggle_text = Drupal.t('Show shortcuts');
  $('#toolbar div.toolbar-drawer').addClass('collapsed');
  $('#toolbar a.toggle')
    .removeClass('toggle-active')
    .attr('title',  toggle_text)
    .html(toggle_text);
  $('body').removeClass('toolbar-drawer').css('paddingTop', Drupal.toolbar.height());
  $.cookie(
    'Drupal.toolbar.collapsed',
    1,
    {
      path: Drupal.settings.basePath,
      // The cookie should "never" expire.
      expires: 36500
    }
  );
};

/**
 * Expand the toolbar.
 */
Drupal.toolbar.expand = function() {
  var toggle_text = Drupal.t('Hide shortcuts');
  $('#toolbar div.toolbar-drawer').removeClass('collapsed');
  $('#toolbar a.toggle')
    .addClass('toggle-active')
    .attr('title',  toggle_text)
    .html(toggle_text);
  $('body').addClass('toolbar-drawer').css('paddingTop', Drupal.toolbar.height());
  $.cookie(
    'Drupal.toolbar.collapsed',
    0,
    {
      path: Drupal.settings.basePath,
      // The cookie should "never" expire.
      expires: 36500
    }
  );
};

/**
 * Toggle the toolbar.
 */
Drupal.toolbar.toggle = function() {
  if ($('#toolbar div.toolbar-drawer').hasClass('collapsed')) {
    Drupal.toolbar.expand();
  }
  else {
    Drupal.toolbar.collapse();
  }
};

Drupal.toolbar.height = function() {
  var $toolbar = $('#toolbar');
  var height = $toolbar.outerHeight();
  // In modern browsers (including IE9), when box-shadow is defined, use the
  // normal height.
  var cssBoxShadowValue = $toolbar.css('box-shadow');
  var boxShadow = (typeof cssBoxShadowValue !== 'undefined' && cssBoxShadowValue !== 'none');
  // In IE8 and below, we use the shadow filter to apply box-shadow styles to
  // the toolbar. It adds some extra height that we need to remove.
  if (!boxShadow && /DXImageTransform\.Microsoft\.Shadow/.test($toolbar.css('filter'))) {
    height -= $toolbar[0].filters.item("DXImageTransform.Microsoft.Shadow").strength;
  }
  return height;
};

})(jQuery);
;
