<div class="acp-page-container">
	<!-- IMPORT admin/partials/settings/header.tpl -->

	<div class="row m-0">
		<div id="spy-container" class="col-12 col-md-8 px-0 mb-4" tabindex="0">
			<form role="form" class="restrict-usernames-settings">
				<h5>[[restrict-usernames:rules]]</h5>
				<div class="mb-4">
					<div class="">
						{{{ each rules }}}
						<div class="rulebox">
							<h6>{rules.name}</h6>
							<div class="form-check">
								<input type="checkbox" class="form-check-input" id="{@key}-enabled" name="{@key}-enabled">
								<label for="{@key}-enabled" class="form-check-label">[[restrict-usernames:enabled]]</label>
							</div>
							<label for="{@key}" class="form-text">{rules.description}</label>
							{{{ if (rules.type=="number") }}}
								<div class="form-group">
									<input type="number" class="form-control" placeholder="{rules.placeholder}" id="{@key}-value" name="{@key}-value" min="{rules.min}" max="{rules.max}" step="{rules.step}">
								</div>
							{{{ end }}}
							{{{ if (rules.type=="rules") }}}
								<div class="my-3 col-12" data-type="sorted-list" data-sorted-list="{@key}-rules" data-item-template="admin/plugins/restrict-usernames/partials/rules/item" data-form-template="admin/plugins/restrict-usernames/partials/rules/form">
									<ul data-type="list" class="list-group mb-2"></ul>
									<button type="button" data-type="add" class="btn btn-info">[[restrict-usernames:add-item]]</button>
								</div>
							{{{ end }}}
						</div>
						<hr>
						{{{ end }}}
						<div class="mb-3">
							<h5>[[restrict-usernames:groups-checked]]</h5>
							<label class="form-label" for="groupsChecked">[[restrict-usernames:groups-checked-description]]</label>
							<select id="groupsChecked" class="form-select" multiple name="groupsChecked" data-type="select">
								{{{ each groupsChecked }}}
								<option value="{groupsChecked.displayName}">{groupsChecked.displayName}</option>
								{{{ end }}}
							</select>
						</div>
					</div>
				</div>
			</form>

		</div>

		<!-- IMPORT admin/partials/settings/toc.tpl -->
	</div>
</div>
