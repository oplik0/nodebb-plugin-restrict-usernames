<form role="form" class="restrict-usernames-settings">
	<div class="row mb-4">
		<div class="col-sm-2 col-12 settings-header">[[restrict-usernames:rules]]</div>
		<div class="col-sm-10 col-12">
			{{{ each rules }}}
			<div class="rulebox">
				<h3>{rules.name}</h3>
				<div class="form-check">
					<input type="checkbox" class="form-check-input" id="{@key}-enabled" name="{@key}-enabled">
					<label for="{@key}-enabled" class="form-check-label">[[restrict-usernames:enabled]]</label>
				</div>
				<label for="{@key}" class="form-label">{rules.description}</label>
				{{{ if (rules.type=="number") }}}
					<div class="form-group">
						<input type="number" class="form-control" placeholder="{rules.placeholder}" id="{@key}-value" name="{@key}-value" min="{rules.min}" max="{rules.max}" step="{rules.step}">
					</div>
				{{{ end }}}
				{{{ if (rules.type=="rules") }}}
					<div class="mb-3 col-12" data-type="sorted-list" data-sorted-list="{@key}-rules" data-item-template="admin/plugins/restrict-usernames/partials/rules/item" data-form-template="admin/plugins/restrict-usernames/partials/rules/form">
						<ul data-type="list" class="list-group mb-2"></ul>
						<button type="button" data-type="add" class="btn btn-info">[[restrict-usernames:add-item]]</button>
					</div>
				{{{ end }}}
			</div>
			<hr>
			{{{ end }}}
			<div class="mb-3">
				<h3>[[restrict-usernames:groups-checked]]</h3>
				<label class="form-label" for="groupsChecked">[[restrict-usernames:groups-checked-description]]</label>
				<select id="groupsChecked" class="form-select" multiple name="groupsChecked" data-type="select">
					{{{ each groupsChecked }}}
					<option value="{groupsChecked.name}">{groupsChecked.name}</option>
					{{{ end }}}
				</select>
			</div>
		</div>
	</div>
</form>

<button id="save" class="restrict-username-save-button btn btn-primary position-fixed bottom-0 end-0 px-3 py-2 mb-4 me-4 rounded-circle fs-4" type="button" style="width: 64px; height: 64px;">
	<i class="fa fa-fw fas fa-save"></i>
</button>