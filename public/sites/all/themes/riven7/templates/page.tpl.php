<div id="page-wrapper"><div id="page"><div id="riventree"></div>

  <div id="header"><div id="header-inner">

  
     <h1><a href="/" title="Home" rel="home" id="logo"><img src="/images/rivendesign.png" alt="Riven Design" /></a></h1>


   

<?php print render($page['header']); ?>
</div>
  </div><!-- /#name-and-slogan -->
	  <div class="skip">
    <a href="#content">Skip to Main Content, Press Enter to Activate</a>
  </div>


<!-- /.section, /#header -->

  <div id="main-wrapper"><div id="main" class="<?php if ($main_menu || $page['navigation']) { print ' with-navigation'; } ?>">
  <?php print render($page['sidebar_first']); ?>

    <?php print render($page['sidebar_second']); ?>
    <div id="content" class="column"><div class="section"><div id="content-wrap">
      <?php print render($page['highlight']); ?>
	 <?php print $breadcrumb; ?>
      <?php print render($title_prefix); ?>
      <?php if ($title): ?>
        <h1 class="title" id="page-title"><?php print $title; ?></h1>
      <?php endif; ?>
      <?php print render($title_suffix); ?>
      <?php print $messages; ?>
      <?php if ($tabs = render($tabs)): ?>
        <div class="tabs"><?php print $tabs; ?></div>
      <?php endif; ?>
      <?php print render($page['help']); ?>
      <?php if ($action_links): ?>
        <ul class="action-links"><?php print render($action_links); ?></ul>
      <?php endif; ?>
      <?php print render($page['content']); ?>
      <?php print $feed_icons; ?>
    </div></div></div><!-- /.section, /#content -->

    
  

  </div></div><!-- /#main, /#main-wrapper -->
<div class="cleaner"></div>
  <?php if ($page['footer'] || $secondary_menu): ?>
    <div id="footer"><div class="section">

      <?php print theme('links__system_secondary_menu', array(
        'links' => $secondary_menu,
        'attributes' => array(
          'id' => 'secondary-menu',
          'class' => array('links', 'inline'),
        ),
        'heading' => array(
          'text' => t('Secondary menu'),
          'level' => 'h2',
          'class' => array('element-invisible'),
        ),
      )); ?>

      <?php print render($page['footer']); ?>

    </div></div><!-- /.section, /#footer -->
  <?php endif; ?>

</div></div><!-- /#page, /#page-wrapper -->

<?php print render($page['bottom']); ?>
