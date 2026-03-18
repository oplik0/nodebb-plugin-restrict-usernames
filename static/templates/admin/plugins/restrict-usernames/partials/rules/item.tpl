<li data-type="item" class="list-group-item">
    <div class="d-flex align-items-center gap-1 justify-content-between">
        <div class="">
            {rule}
            {{{ if (insensitive == "on") }}}
                [[restrict-usernames:insensitive]]
            {{{ endif }}}
        </div>
        <div class="d-flex gap-2">
            <button type="button" data-type="edit" class="btn btn-info">Edit</button>
            <button type="button" data-type="remove" class="btn btn-danger">Delete</button>
        </div>
    </div>
</li>