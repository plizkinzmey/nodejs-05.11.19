const container = document.querySelector('.tasks__container');

/** 
 * функция обработчик удаления события
 * @param target event.target
 **/
async function handleDelete(target) {
    const { dataset: { id } } = target;
    const result = await fetch('/tasks', {
         method: 'DELETE',
         headers: {
             'Content-Type': 'application/json'
         },
         body: JSON.stringify({ id })
     });

    if ( result ) {
        target.parentNode.parentNode.remove();
    }
}

/** 
 * функция обработчик удаления события
 * @param target event.target
 **/
async function handleToggleStatus(target) {
    const { dataset: { id } } = target;
    const result = await fetch(`/tasks/${ id }`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
     });

    if ( result ) {
        target.value = result;
    }
}

/** переход на страницу указаную в дада атрибуте */
function handleChangeLocation(target) {
    const { dataset: { href } } = target;
    location.href = href;
}

if ( container ) {
    container.addEventListener( 'click', ( event ) => {
        const { target } = event;
        const { classList } = target;
        if ( classList.contains('btn_delete')) {
            handleDelete(target);
        } else if ( classList.contains('btn_check') ) {
            handleToggleStatus(target);
        } else if ( classList.contains('btn_update') ) {
            handleChangeLocation( target );
        }
    });
}