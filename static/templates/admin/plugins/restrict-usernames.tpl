<form role="form" class="restrict-usernames-settings">
	<div class="row mb-4">
		<div class="col-sm-2 col-12 settings-header">Rules</div>
		<div class="col-sm-10 col-12">
			{{{ each rules }}}
			<div class="rulebox">
				<label for="{@key}" class="form-label">{rules.description}</label>
				{{{ if (rules.type == "boolean") }}}
					<div class="form-check">
						<input type="checkbox" class="form-check-input" id="{@key}-enabled" name="{@key}-enabled">
						<label for="{@key}-enabled" class="form-check-label">{rules.name}</label>
					</div>
				{{{ end }}}
			</div>
			<hr>
			{{{ end }}}
		</div>
	</div>
</form>

<button id="save" class="restrict-username-save-button btn btn-primary position-fixed bottom-0 end-0 px-3 py-2 mb-4 me-4 rounded-circle fs-4" type="button" style="width: 64px; height: 64px;">
	<i class="fa fa-fw fas fa-save"></i>
</button>