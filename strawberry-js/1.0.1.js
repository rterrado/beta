(function(){var DomReady = window.DomReady = {};

// Everything that has to do with properly supporting our document ready event. Brought over from the most awesome jQuery.

var userAgent = navigator.userAgent.toLowerCase();

// Figure out what browser is being used
var browser = {
	version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
	safari: /webkit/.test(userAgent),
	opera: /opera/.test(userAgent),
	msie: (/msie/.test(userAgent)) && (!/opera/.test( userAgent )),
	mozilla: (/mozilla/.test(userAgent)) && (!/(compatible|webkit)/.test(userAgent))
};

var readyBound = false;
var isReady = false;
var readyList = [];

// Handle when the DOM is ready
function domReady() {
	// Make sure that the DOM is not already loaded
	if(!isReady) {
		// Remember that the DOM is ready
		isReady = true;

        if(readyList) {
            for(var fn = 0; fn < readyList.length; fn++) {
                readyList[fn].call(window, []);
            }

            readyList = [];
        }
	}
};

// From Simon Willison. A safe way to fire onload w/o screwing up everyone else.
function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
};

// does the heavy work of working through the browsers idiosyncracies (let's call them that) to hook onload.
function bindReady() {
	if(readyBound) {
	    return;
    }

	readyBound = true;

	// Mozilla, Opera (see further below for it) and webkit nightlies currently support this event
	if (document.addEventListener && !browser.opera) {
		// Use the handy event callback
		document.addEventListener("DOMContentLoaded", domReady, false);
	}

	// If IE is used and is not in a frame
	// Continually check to see if the document is ready
	if (browser.msie && window == top) (function(){
		if (isReady) return;
		try {
			// If IE is used, use the trick by Diego Perini
			// http://javascript.nwbox.com/IEContentLoaded/
			document.documentElement.doScroll("left");
		} catch(error) {
			setTimeout(arguments.callee, 0);
			return;
		}
		// and execute any waiting functions
	    domReady();
	})();

	if(browser.opera) {
		document.addEventListener( "DOMContentLoaded", function () {
			if (isReady) return;
			for (var i = 0; i < document.styleSheets.length; i++)
				if (document.styleSheets[i].disabled) {
					setTimeout( arguments.callee, 0 );
					return;
				}
			// and execute any waiting functions
            domReady();
		}, false);
	}

	if(browser.safari) {
	    var numStyles;
		(function(){
			if (isReady) return;
			if (document.readyState != "loaded" && document.readyState != "complete") {
				setTimeout( arguments.callee, 0 );
				return;
			}
			if (numStyles === undefined) {
                var links = document.getElementsByTagName("link");
                for (var i=0; i < links.length; i++) {
                	if(links[i].getAttribute('rel') == 'stylesheet') {
                	    numStyles++;
                	}
                }
                var styles = document.getElementsByTagName("style");
                numStyles += styles.length;
			}
			if (document.styleSheets.length != numStyles) {
				setTimeout( arguments.callee, 0 );
				return;
			}

			// and execute any waiting functions
			domReady();
		})();
	}

	// A fallback to window.onload, that will always work
    addLoadEvent(domReady);
};

// This is the public function that people can use to hook up ready.
DomReady.ready = function(fn, args) {
	// Attach the listeners
	bindReady();

	// If the DOM is already ready
	if (isReady) {
		// Execute the function immediately
		fn.call(window, []);
    } else {
		// Add the function to the wait list
        readyList.push( function() { return fn.call(window, []); } );
    }
};

bindReady();
class Services { 
constructor(){
}
$blocks(renderObj,renderElement){
    // Finds all elements with Block attributes
    let allBlockElements = strawberry.$getElementsFrom(renderElement,BLOCK_ELEMENT_ATTR);
    for (var i = 0; i < allBlockElements.length; i++) {
        this.$scope(renderObj,allBlockElements[i]);
    }
}
$checks(renderObj,renderElement){

    // Finds all elements with CHECK attributes
    let allCheckElements = strawberry.$getElementsFrom(renderElement,CHECK_ELEMENT_ATTR);

    for (var i = 0; i < allCheckElements.length; i++) {

        let checkElement = allCheckElements[i];

        // Checked if element is locked
        if (this.$isLocked(checkElement)) continue;

        // Evaluating the value of the checked element
        let evaluator = strawberry.$getXValue(checkElement,CHECK_ELEMENT_ATTR);
        let returned = strawberry.$resolver().expression(renderObj.export(),evaluator);

        // Check if the returned value is typeof boolean
        if (typeof returned == 'boolean')
            returned ? checkElement.setAttribute('checked','') : checkElement.removeAttribute('checked');

        this.$lock(checkElement);

        this.$scope(renderObj,checkElement);

    }

}
$component(){
    return {
        register:function(componentElement){

            // Get the name of the component
            let componentName = strawberry.$getAtElementName(componentElement,COMPONENT_ELEMENT_ATTR);

            // Checking whether the component is declared
            if (App.components.hasOwnProperty(componentName)) {

                // Creating a new element template
                let tempElement = create_element(componentElement.innerHTML);

                // Removing any component element
                let allComponentsInTemplate = strawberry.$getElementsFrom(tempElement,COMPONENT_ELEMENT_ATTR);
                for (var i = 0; i < allComponentsInTemplate.length; i++) {
                    allComponentsInTemplate[i].innerHTML = '';
                }

                // Register component template
                App.components[componentName].setTemplate(tempElement.innerHTML)

                App.components[componentName].build();

            }

            return componentName;

        },
        render:function(componentElement){

            // Create a temporary element where we can safely render the component
            let component = create_element('');

            // Get the component name
            let componentName = strawberry.$getAtElementName(componentElement,COMPONENT_ELEMENT_ATTR);

            // Checking whether the component is declared
            if (App.components.hasOwnProperty(componentName)) {

                // Render the component content
                let _services = new Services();
                component.innerHTML = App.components[componentName].getTemplate();
                _services.$render(App.components[componentName],component);
                return component;

            }

            return null;
        }
    }
}
$disablers(renderObj,renderElement){

    // Finds all elements with DISABLE attributes
    let allToDisableElements = strawberry.$getElementsFrom(renderElement,DISABLE_ELEMENT_ATTR);

    // Looping through the elements
    for (var i = 0; i < allToDisableElements.length; i++) {

        let toDisableElement = allToDisableElements[i];
        let elementName = strawberry.$getAtElementName(toDisableElement,DISABLE_ELEMENT_ATTR);

        if (null===renderObj.getFormState(elementName)) {
            // Registering the element
            renderObj.addFormState(elementName,false);
        }
        toDisableElement.disabled = !renderObj.getFormState(elementName);
        this.$scope(renderObj,toDisableElement);

    }

}
$enablers(renderObj,renderElement){

    // Finds all elements with ENABLE attributes
    let allToEnableElements = strawberry.$getElementsFrom(renderElement,ENABLE_ELEMENT_ATTR);

    // Looping through the elements
    for (var i = 0; i < allToEnableElements.length; i++) {

        let toEnableElement = allToEnableElements[i];
        let elementName = strawberry.$getAtElementName(toEnableElement,ENABLE_ELEMENT_ATTR);

        if (null===renderObj.getFormState(elementName)) {
            // Registering the element
            renderObj.addFormState(elementName,true);
        }

        toEnableElement.disabled = !renderObj.getFormState(elementName);
        this.$scope(renderObj,toEnableElement);

    }

}
$events(renderObj,renderElement){

    /**
     * This function adds event listener to elements which is bound to a function
     * within the component scope
     */
    let add_event=function(renderObj,eventElement,fnExpression,eventType){
        if (strawberry.$resolver().getResolveType(fnExpression)!=='function') return;
        eventElement.addEventListener(eventType,()=>{
            strawberry.$resolver().expression(renderObj.export(),fnExpression,eventElement);
        });
    }

    const Events = [
        {type: 'click',attr: CLICK_EVENT_ATTR},
        {type: 'change',attr: CHANGE_EVENT_ATTR},
        {type: 'keyup',attr: TOUCH_EVENT_ATTR}
    ];

    for (var i = 0; i < Events.length; i++) {
        let Event = Events[i];
        // Finds all elements
        let allElements = strawberry.$getElementsFrom(renderElement,Event.attr);
        // Looping through each of the elements
        for (var k = 0; k< allElements.length; k++) {
            let element = allElements[k];
            let fnExpression = strawberry.$getXValue(element,Event.attr);
            if (this.$isEventLocked(element,Event.type)) continue;
            add_event(renderObj,element,fnExpression,Event.type);
            this.$lockEvent(element,Event.type);
        }

    }

}
$hides(renderObj,renderElement){
    // Finds all hideable elements
    let hideableElements = strawberry.$getElementsFrom(renderElement,HIDE_ELEMENT_ATTR);
    for (var i = 0; i < hideableElements.length; i++) {
        let hideableElement = hideableElements[i];
        let hideableName = strawberry.$getAtElementName(hideableElement,HIDE_ELEMENT_ATTR);
        if (null===renderObj.getHidden(hideableName)) {
            renderObj.addHidden(hideableName,hideableElement.innerHTML,true);
            hideableElement.innerHTML = '';
            this.$scope(renderObj,hideableElement);
            continue;
        }
        if (renderObj.getHidden(hideableName).state) {
            hideableElement.innerHTML = '';
        }
        this.$scope(renderObj,hideableElement);
    }
}
$ifs(renderObj,renderElement){

    // Finds all elements with IF conditionals
    let allElemWithIfConditionals = strawberry.$getElementsFrom(renderElement,IF_ELEMENT_ATTR);

    // Looping through conditional elements
    for (var i = 0; i < allElemWithIfConditionals.length; i++) {
        let conditionalElement = allElemWithIfConditionals[i];

        if (!this.$isLocked(conditionalElement)) {

            // Resolving the argument of the conditional element
            let argument = strawberry.$getXValue(conditionalElement,IF_ELEMENT_ATTR);
            let resolved = strawberry.$resolver().expression(renderObj.export(),argument.trim());


            if (typeof resolved == 'boolean' && !resolved) {
                conditionalElement.innerHTML = '';
                if (null!==conditionalElement.parentNode)
                    strawberry.$disposeElement(conditionalElement,false);
            }

            this.$lock(conditionalElement);

        }


    }

}
$lock(element){
    let lockAttrName = App.prefix+'set';
    element.setAttribute(lockAttrName,'scope');
}

$isLocked(element){
    let lockAttrName = App.prefix+'set';
    if (element.getAttribute(lockAttrName)===null)
        return false;
    return true;
}

$isEventLocked(element,eventName){
    let lockAttrName = App.prefix+'event';
    let result = false;
    let eventsAdded = element.getAttribute(lockAttrName);
    if (eventsAdded===null) return false;
    let allEvents = eventsAdded.split(',');
    for (var i = 0; i < allEvents.length; i++) {
        if (eventName===allEvents[i]) {
            result = true;
        }
    }
    return result;
}

$lockEvent(element,eventName){
    let lockAttrName = App.prefix+'event';
    let eventsAdded = element.getAttribute(lockAttrName);
    if (eventsAdded===null) {
        element.setAttribute(lockAttrName,eventName);
        return;
    }
    let allEvents = eventsAdded.split(',');
    for (var i = 0; i < allEvents.length; i++) {
        if (eventName!==allEvents[i]) {
            allEvents.push(eventName);
        }
    }
    element.setAttribute(lockAttrName,allEvents.join(','));
}
$models(renderObj,renderElement){

    let modelAttrName = App.prefix+'model';

    /**
     * This function attemps to add an undefined model as part of the scope
     * For example, if you assign xmodel="user.firstName", but firstName
     * is not defined in $scope.user, then this function will add firstName
     * as member property of $scope.user automatically
     */
    let assign_Value=function(renderObj,modelExpression,modelValue){
        let parentObj = strawberry.$resolver().getParentObj(renderObj.export(),modelExpression);
        let childObjExpression = strawberry.$resolver().getChildObjectExp(modelExpression);
        if (undefined!==parentObj)
            parentObj[childObjExpression] = modelValue;
    }

    let assign_State=function(modelElement,modelState,modelExpression){
        (typeof modelState == 'boolean' && modelState) ?
            modelElement.setAttribute('checked','') :
            modelElement.removeAttribute('checked');
    }

    let update_Value=function(modelElement){
        console.log(modelElement.checked);
    }

    // Finds all elements with MODEL attributes
    let allModelElements = strawberry.$getElementsFrom(renderElement,MODEL_ELEMENT_ATTR);

    for (var i = 0; i < allModelElements.length; i++) {

        let modelElement = allModelElements[i];

        // Evaluating the value of the model element
        let modelExpression = strawberry.$getXValue(modelElement,MODEL_ELEMENT_ATTR);
        let resolvedObject = strawberry.$resolver().expression(renderObj.export(),modelExpression);
        let ModelValueStringType = true;

        // Different behavior for different input types
        if (modelElement.tagName==='INPUT'||modelElement.tagName==='SELECT') {

            // <input type="radio">
            if (modelElement.type==='radio') {
                ModelValueStringType = false;
                (resolvedObject===undefined) ?
                    assign_Value(renderObj,modelExpression,false) :
                    assign_State(modelElement,resolvedObject,modelExpression);
            }

            // <input type="checkbox">
            if (modelElement.type==='checkbox') {
                ModelValueStringType = false;
                (resolvedObject===undefined) ?
                    assign_Value(renderObj,modelExpression,false) :
                    assign_State(modelElement,resolvedObject,modelExpression);
            }

            // <input type="text"> or <select></select>
            if (modelElement.type==='text'||modelElement.tagName==='SELECT') {
                (resolvedObject===undefined) ?
                    assign_Value(renderObj,modelExpression,modelElement.value) :
                    modelElement.value = resolvedObject
            }

            modelElement.addEventListener('change',function(){
                assign_Value(
                    renderObj,
                    modelExpression,
                    (ModelValueStringType) ? modelElement.value : modelElement.checked
                );
            });
        }

    }

}
$placeholders(renderObj,renderElement){
    let regularExpression = /(?<=\{{).+?(?=\}})/g;
    let template = renderElement.innerHTML;

    renderElement.innerHTML = '';

    // Match all regex in the innerHTML string of the element
    let allMatchedData = template.match(regularExpression);

    // If there is a match regex
    if (allMatchedData!==null) {
        for (var i = 0; i < allMatchedData.length; i++) {
            let resolvedExpression = strawberry.$resolver().expression(renderObj.export(),allMatchedData[i].trim());
            if (resolvedExpression===undefined) {
                resolvedExpression='';
            }
            template = template.replace('{{'+allMatchedData[i]+'}}',resolvedExpression);
        }
    }

    renderElement.innerHTML = template;

}
// Renders the element based on the values of the scope object
$render(renderObj,renderElement,skip=null){

    // Temporarily hides the given scope element
    //renderElement.style.opacity='0';

    this.$repeats(renderObj,renderElement);
    this.$ifs(renderObj,renderElement);
    this.$hides(renderObj,renderElement);
    this.$shows(renderObj,renderElement);
    this.$placeholders(renderObj,renderElement);
    this.$checks(renderObj,renderElement);
    this.$styles(renderObj,renderElement);
    this.$models(renderObj,renderElement);
    this.$disablers(renderObj,renderElement);
    this.$enablers(renderObj,renderElement);
    this.$blocks(renderObj,renderElement);

    if (skip!=='events'){
        this.$events(renderObj,renderElement);
    }



}
$repeats(renderObj,renderElement){

    let REFERENCE_TOKEN = '$$index';

    // Converts repeat expression into two entites: refObjName and aliasObjName
    let parseExp = function(expression){
        if (expression.includes('until '))
            return [REFERENCE_TOKEN,expression.split('until')[1].trim()];
        return [
            expression.split(' as ')[0].trim(),
            expression.split(' as ')[1].trim()
        ];
    }

    // Finds all elements with repeatable elements
    let repeatElements = strawberry.$getElementsFrom(renderElement,REPEAT_ELEMENT_ATTR);

    // Looping through repeatable elements
    for (var i = 0; i < repeatElements.length; i++) {

        let repeatElement = repeatElements[i];
        let htmlTemplate = repeatElement.innerHTML;

        // Emptying the repeatable element, to be populated
        // later with the repeated content
        repeatElement.innerHTML = '';

        let expression = strawberry.$getXValue(repeatElement,REPEAT_ELEMENT_ATTR);
        let [refObjName,aliasObjName] = parseExp(expression);

        if (refObjName===REFERENCE_TOKEN) {

            // This creates a new object that we can loop through
            let repetitions = strawberry.$resolver().expression(renderObj.export(),aliasObjName);

            // How many repitions are to be made
            let repeatTimes = 0;
            if (repetitions instanceof Array) repeatTimes = repetitions.length;
            if (Number.isInteger(repetitions)) repeatTimes = repetitions;

            renderObj.export().$$index = {};
            let k = 0;
            while (k<repeatTimes)
                renderObj.export().$$index['props'+(k++)] = new Object;

        }

        let repeatableObject = strawberry.$resolver().expression(renderObj.export(),refObjName);

        if (undefined!==repeatableObject&&null!==repeatableObject) {
            let j = 0;
            for (const [key, value] of Object.entries(repeatableObject)) {

                // Creating an invidual component for each repititions
                let contextObj = (new Component())
                                 .setTemplate(htmlTemplate)
                                 .setProps(aliasObjName,value)
                                 .setProps('$parent',renderObj.export())
                                 .setProps('$index',j++);

                let repeatTemplateElement = create_element(htmlTemplate);
                this.$render(contextObj,repeatTemplateElement,'events');
                bind_element(repeatTemplateElement,repeatElement);

            }
        }


    }


}
$scope(renderObj,renderElement){
    let scopeAttrName = App.prefix+'scope';
    renderElement.setAttribute(scopeAttrName,'$'+renderObj.getName());
}
$shows(renderObj,renderElement){
    // Finds all showable elements
    let showableElements = strawberry.$getElementsFrom(renderElement,SHOW_ELEMENT_ATTR);
    for (var i = 0; i < showableElements.length; i++) {
        let showableElement = showableElements[i];
        let showableName = strawberry.$getAtElementName(showableElement,SHOW_ELEMENT_ATTR);
        if (null===renderObj.getHidden(showableName)) {
            renderObj.addHidden(showableName,showableElement.innerHTML,false);
            this.$scope(renderObj,showableElement);
            continue;
        }
        if (renderObj.getHidden(showableName).state) {
            showableElement.innerHTML = '';
        }
        this.$scope(renderObj,showableElement);

    }
}
$styles(renderObj,renderElement){

    // Finds all elements with STYLE attributes
    let allStyleElements = strawberry.$getElementsFrom(renderElement,STYLE_ELEMENT_ATTR);

    for (var i = 0; i < allStyleElements.length; i++) {

        let styleElement = allStyleElements[i];

        // Checked if element is locked
        if (this.$isLocked(styleElement)) continue;

        // Evaluating the value of the checked element
        let evaluator = strawberry.$getXValue(styleElement,STYLE_ELEMENT_ATTR);
        let returned = strawberry.$resolver().expression(renderObj.export(),evaluator);

        if (returned!==null&&returned!==''&&returned!==undefined)
            styleElement.classList.add(returned);

        this.$lock(styleElement);

    }

}
    $public() {
        return {
$block:function(args,contextObj){
    let blocks = strawberry.$getAtElementFrom(document,BLOCK_ELEMENT_ATTR,args.name);
    let b = 0;
    for (var i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        if (strawberry.$isScopeOfComponent(block,contextObj.getName())) {
            args.each(new Element(block),b);
            b++;
        }
    }
}
, 
$disable:function(elementName,contextObj){
    let types = [ENABLE_ELEMENT_ATTR,DISABLE_ELEMENT_ATTR];
    for (var k = 0; k < types.length; k++) {
        let toDisables = strawberry.$getAtElementFrom(document,types[k],elementName);
        for (var i = 0; i < toDisables.length; i++) {
            let toDisable = toDisables[i];
            if (strawberry.$isScopeOfComponent(toDisable,contextObj.getName())) {
                if (contextObj.getFormState(elementName)) {
                    contextObj.addFormState(elementName,false);
                    toDisable.disabled = true;
                }
            }
        }
    }

}
, 
$enable:function(elementName,contextObj){
    let types = [ENABLE_ELEMENT_ATTR,DISABLE_ELEMENT_ATTR];
    for (var k = 0; k < types.length; k++) {
        let toEnables = strawberry.$getAtElementFrom(document,types[k],elementName);
        for (var i = 0; i < toEnables.length; i++) {
            let toEnable = toEnables[i];
            if (strawberry.$isScopeOfComponent(toEnable,contextObj.getName())) {
                if (!contextObj.getFormState(elementName)) {
                    contextObj.addFormState(elementName,true);
                    toEnable.disabled = false;
                }
            }
        }
    }
}
, 
$hide:function(elementName,contextObj){
    let types = [SHOW_ELEMENT_ATTR,HIDE_ELEMENT_ATTR];
    for (var k = 0; k < types.length; k++) {
        let hideables = strawberry.$getAtElementFrom(document,types[k],elementName);
        for (var i = 0; i < hideables.length; i++) {
            let hideable = hideables[i];
            if (strawberry.$isScopeOfComponent(hideable,contextObj.getName())) {
                let stateReg = contextObj.getHidden(elementName);
                if (!stateReg.state) {
                    stateReg.state = true;
                    hideable.innerHTML = '';
                }
            }
        }
    }
}
, 
$patch:function(args,contextObj){

    let patchSvc = function(){

        let patchTemplate = create_component(contextObj.getName(),contextObj.getTemplate());

        let components = strawberry.$getElementsFrom(patchTemplate,COMPONENT_ELEMENT_ATTR);

        let late_binder = [];


        // Looping through all declared components in the DOM
        for (var i = 0; i < components.length; i++) {

            // Get the name of the component
            let componentName = strawberry.$getAtElementName(components[i],COMPONENT_ELEMENT_ATTR);


            // We do not patch any other component, but since the DOM has to be updated
            // when patch is called, the child component, if there is any, has to be copied
            // directly, whatever the state of component, to the component elements.
            if (i>0) {
                if (null===strawberry.$getComponentFrom(document,componentName)) {
                    late_binder.push(()=>{
                        if(null===strawberry.$getComponentFrom(document,componentName)) return;
                        let new_services = new Services();
                        new_services.$public().$patch('',App.components[componentName]);
                    });
                } else {
                    bind_element(
                        strawberry.$getComponentFrom(document,componentName),
                        strawberry.$getComponentFrom(patchTemplate,componentName)
                    );
                }
                continue;
            }

            let _services = new Services();
            let component = _services.$component().render(components[i]);

            // Deactivate element when it's not declared
            if (null===component) {
                strawberry.$disposeElement(
                    strawberry.$getComponentFrom(patchTemplate,componentName),
                    'No component declared'
                );
                continue;
            }

            // Render element when it's declared
            if (null!==strawberry.$getComponentFrom(patchTemplate,componentName)) {
                strawberry.$getComponentFrom(patchTemplate,componentName).innerHTML = '';
                bind_element(component,strawberry.$getComponentFrom(patchTemplate,componentName));
            }

        }

        let appElement = document.querySelector('[xstrawberry="'+App.name+'"]');

        strawberry.$getComponentFrom(appElement,contextObj.getName()).innerHTML = '';

        // Apends the template to the DOM
        bind_element(patchTemplate.childNodes[0],strawberry.$getComponentFrom(appElement,contextObj.getName()));

        for (var s = 0; s < late_binder.length; s++) {
            late_binder[s]();
        }


    }


    if (!App.isReady) {
        App.onReady.push(function(){
            patchSvc();
        });
    } else {
        patchSvc();
    }


}
, 
$show:function(elementName,contextObj){
    let types = [SHOW_ELEMENT_ATTR,HIDE_ELEMENT_ATTR];
    for (var k = 0; k < types.length; k++) {
        let showables = strawberry.$getAtElementFrom(document,types[k],elementName);
        for (var i = 0; i < showables.length; i++) {
            let showable = showables[i];
            if (strawberry.$isScopeOfComponent(showable,contextObj.getName())) {
                let stateReg = contextObj.getHidden(elementName);
                if (stateReg.state) {
                    stateReg.state = false;
                    showable.innerHTML = stateReg.template;
                }
            }
        }
    }
}
, 
$toggle:function(elementName,contextObj){
    let types = [SHOW_ELEMENT_ATTR,HIDE_ELEMENT_ATTR];
    for (var k = 0; k < types.length; k++) {
        let toggleables = strawberry.$getAtElementFrom(document,types[k],elementName);
        for (var i = 0; i < toggleables.length; i++) {
            let toggleable = toggleables[i];
            if (strawberry.$isScopeOfComponent(toggleable,contextObj.getName())) {
                let stateReg = contextObj.getHidden(elementName);
                if (stateReg.state) {
                    stateReg.state = false;
                    toggleable.innerHTML = stateReg.template;
                } else {
                    stateReg.state = true;
                    toggleable.innerHTML = '';
                }
            }
        }
    }
}
        }
    }
}class Component {
    constructor(name){
        this.name = name;
        this.props = {};
        this.parents = [];
        this.children = [];
        this.template = '';
        this.hidden = {};
        this.formState = {};
        this.callbackFn = '';
        this.hasBuilt = false;
    }
    export(){
        return this.props;
    }
    getName(){
        return this.name;
    }
    setCallable(callable){
        this.callable = callable;
        return this;
    }
    getCallable(){
        if (!this.hasBuilt)
            this.build();
        return this.callable;
    }
    setTemplate(template){
        this.template = template;
        return this;
    }
    setProps(key,value){
        this.props[key] = value;
        return this;
    }
    getTemplate(){
        return this.template;
    }
    addHidden(elementName,template,state){
        this.hidden[elementName] = {
            template: template,
            state: state
        };
    }
    getHidden(elementName){
        return this.hidden[elementName] ?? null;
    }
    addFormState(elementName,state){
        this.formState[elementName] = state;
    }
    getFormState(elementName){
        return this.formState[elementName] ?? null;
    }
    setCallbackFn(callbackFn){
        this.callbackFn = callbackFn;
    }
    build(){

        if (this.hasBuilt)
            return this.callable;

        // Injecting dependencies to the callback function
        let injector = new Injector(
            this.callbackFn.toString(),
            this,
            COMPONENT_OBJECT
        );
        // Resolving dependency injection
        let args = injector.resolve();

        // Parking the callback function
        this.setCallable(this.callbackFn(...args));

        this.hasBuilt = true;
    }
}
class Element {
    constructor(element,treeCount=null){
        this.$element = element;
        if (treeCount==null) {
            treeCount = 1;
        }
        if (treeCount<4&&element.parentElement!==null) {
            this.$parent = new Element(element.parentElement,treeCount++);
        }
    }
    get(){
        return this.$element;
    }
    referenceScope(scopeObject){
        this.$element.scopeOf = scopeObject;
    }
    addClass(className){
        this.$element.classList.add(className);
    }
    listClass(){
        return this.$element.className.split(' ');
    }
    removeClass(className){
        this.$element.classList.remove(className);
    }
    toggleClass(className){
        let classes = this.listClass();
        for (var i = 0; i < classes.length; i++) {
            let clas = classes[i];
            if (clas===className) {
                this.removeClass(className);
            }
            else {
                this.addClass(className);
            }
        }
    }
}
class Factory {
    constructor(){
        this.name = '';
        this.callBackFn = '';
        this.hasBuilt = false;
    }
    setCallbackFn(callbackFn){
        this.callbackFn = callbackFn;
    }
    build(){
        let injector = new Injector(
            this.callbackFn.toString(),
            {},
            FACTORY_OBJECT
        );
        let args = injector.resolve();
        return this.callbackFn(...args);
    }
}
class Injector {
    constructor(fnString,refObj,refObjType){
        this.fnExpression = /(?<=\().+?(?=\))/g;
        this.invalidFnExpression = /[(={})]/g;
        this.fnString = fnString;
        this.refObj = refObj;
        this.refObjType = refObjType;
    }
    resolve(){
        // Set regex to match
        let matchedFunc = this.fnString.match(this.fnExpression);
        // If the function argument is empty, just return empty array
        if (matchedFunc===null) return [];
        // Checking whether the function expression is invalid
        if (this.invalidFnExpression.test(matchedFunc[0])) return [];
        // Match all regex in the innerHTML string of the element
        let argumentExpression = matchedFunc[0];
        let allArguments = argumentExpression.split(',');
        let argObj = new Array;
        for (var i = 0; i < allArguments.length; i++) {
            // Removing leading and trailing spaces in function arguments
             let arg = allArguments[i].trim();
             // When the argument passed is '$scope', then just return the scope object
             if (arg==='$scope') {
                 if (this.refObjType===COMPONENT_OBJECT)
                    argObj.push(this.refObj.export());
                 continue;
             }
             if (arg.charAt(0)==='$'&&this.refObjType===COMPONENT_OBJECT){
                 let __services = new Services();
                 let publicService = __services.$public()[arg];
                 let refObjCopy = this.refObj;
                 argObj.push(function(serviceArgs){
                     return publicService(serviceArgs,refObjCopy);
                 });
                 continue;
             }
             if (App.components.hasOwnProperty(arg)&&this.refObjType===COMPONENT_OBJECT) {
                 argObj.push(App.components[arg].getCallable());
                 continue;
             }
             if (App.factories.hasOwnProperty(arg)) {
                 argObj.push(App.factories[arg].build());
                 continue
             }
             if (App.services.hasOwnProperty(arg)) {
                 argObj.push(App.services[arg].build());
                 continue
             }
        }
        return argObj;
    }
}
/**
 * @class Resolver
 * Resolves all given expression
 */

class Resolver {

    /**
     * @method expression
     * Resolves an expression based on a given object
     * @param object baseObj
     * @param string expression
     *
     * @returns the value of the resolved expression
     */
    expression(baseObj,expression,element=null){

        // We first determine what type of expression we will need to resolve.
        // This will be based on the structure of the operation
        let resolveType = this.getResolveType(expression);

        // This is where the actual resolve process takes place
        return this.resolve(baseObj,expression,resolveType,element);

    }

    /**
     * @method getResolveType
     * Determines the type of an expression
     * @param string expression
     * @returns type of expression
     *
     * @NOTE: the expression should always have to be a string!
     */
    getResolveType(expression){
        if (/^'.*'$/.test(expression)) return 'string';
        if (!isNaN(expression)) return 'number';
        if (expression.includes('(')) return 'function';
        if (expression.includes('==')) return 'boolOperation';
        if (expression.includes('is ')) return 'boolOperation';
        if (expression.includes('+') || expression.includes('-') || expression.includes('/') || expression.includes('*') || expression.includes('%')) {
            return 'operation';
        }
        if (expression=='false' || expression=='true' || expression=='null') {
            return 'boolean';
        }
        return 'object';
    }
    resolve(scopeObj,expression,resolveType,element=null){

        switch (resolveType) {

            // CASE: STRING
            case 'string':
                return expression.slice(1,-1);
                break;

            case 'boolean':
                if (expression=='true') return true;
                if (expression=='false') return false;
                if (expression=='null') return null;
                break;

            // CASE: OBJECT
            case 'object':
                return this.evalObject(scopeObj,expression);
                break;

            // CASE: FUNCTION
            case 'function':

                /**
                 * @function invokeFunction
                 * Invokes/calls a given function based on the function expression
                 *
                 * @param object refObject - The object where the function to invoke is a member of
                 * @param object argScope - The object where we can reference the argument expression
                 * of the function to invoke
                 * @param string functionExpression - The function expression, for example
                 * myFunction(arg)
                 */
                let invokeFunction=(refObject,argScope,functionExpression)=>{

                    // Parses function structure
                    let splitfunctionExpression = functionExpression.match(/\(([^)]+)\)/);
                    let funcStruct = functionExpression.split('(');
                    let funcName = funcStruct[0];

                    // If function has an argument
                    if (splitfunctionExpression!==null) {

                        // Function argument holder
                        var argObj = new Array;

                        let splitFunctionArguments = splitfunctionExpression[1].split(',');
                        for(var i = 0; i < splitFunctionArguments.length; i++) {
                            argObj.push(this.expression(argScope,splitFunctionArguments[i]));
                        }

                        if (element!==null) {
                            argObj.push(new Element(element));
                        }

                        // Checks if the given is a function
                        if (!(refObject[funcName] instanceof Function)) {
                            return '';
                        }

                        return refObject[funcName](...argObj);
                    }

                    // When there is no argument added to the function, and
                    // if there is an element passed to the Resolver
                    // that means that we need to add the element as one of the
                    // arguments of the referenced function to call
                    if (element!==null) {

                        // Function argument holder
                        var argObj = new Array;
                        argObj.push(new Element(element));

                        return refObject[funcName](...argObj);
                    }


                    if (!(refObject[funcName] instanceof Function)) {
                        return '';
                    }

                    // If it has no argument, and no Element object is required to
                    // be passed as argument to the referenced function to call
                    return refObject[funcName]();
                }


                let funcStruct = expression.split('(');

                // Checks to see if structure of a function resembles an object
                let expressionTest = funcStruct[0].split('.');

                // If the said function is a method of an object
                if (expressionTest.length>1) {

                    let refObject =this.expression(scopeObj,this.getParentObjectExp(funcStruct[0]));

                    let funcExpression = expression.split('.').slice(((expressionTest.length)-1)).join('.');

                    return invokeFunction(refObject,scopeObj,funcExpression);
                }

                if (!scopeObj.hasOwnProperty(funcStruct[0])) {
                    if (strawberry.debug) {
                        console.warn('strawberry.js: Unable to resolve $scope.'+expression);
                    }
                    return '';
                }

                return invokeFunction(scopeObj,scopeObj,expression);

                break;

            // CASE: BOOLEAN OPERATION
            case 'boolOperation':

                let isTheSame=(left,right)=>{
                    return (left===right);
                }

                let isNotTheSame=(left,right)=>{
                    return (left!==right);
                }

                if (expression.includes('!==')) {
                    let comparables = expression.split('!==');
                    return isNotTheSame(this.expression(scopeObj,comparables[0].trim()),this.expression(scopeObj,comparables[1].trim()));
                }
                else if (expression.includes('==')) {
                    let comparables = expression.split('==');
                    return isTheSame(this.expression(scopeObj,comparables[0].trim()),this.expression(scopeObj,comparables[1].trim()));
                }
                else if (expression.includes('is not ')) {
                    let comparables = expression.split('is not');
                    return isNotTheSame(this.expression(scopeObj,comparables[0].trim()),this.expression(scopeObj,comparables[1].trim()));
                }
                else if (expression.includes('is ')) {
                    let comparables = expression.split('is');
                    return isTheSame(this.expression(scopeObj,comparables[0].trim()),this.expression(scopeObj,comparables[1].trim()));
                }

                else {

                }

                break;

            case 'number':
                return Number(expression);
                break;

            case 'operation':

                let finalExpression = expression;

                let operations = ['+','-','*','/','%'];
                for (var i = 0; i < operations.length; i++) {

                    if (expression.includes(operations[i])) {
                        let exp = expression.split(operations[i]);
                        let left = this.expression(scopeObj,exp[0].trim());
                        var right = this.expression(scopeObj,exp[1].trim());
                        finalExpression = left+operations[i]+right;
                    }
                }

                return eval(finalExpression);
                break;
        }
    }
    evalObject(scopeObj,objectExpression){
        if (objectExpression==='$scope') {
            return scopeObj;
        }
        return objectExpression.split(".").reduce(function(o,x){
            if (o===undefined) {
                return;
            }
            if (o[x]===undefined) {
                return;
            }
            return o[x];
        }, scopeObj);
    }
    getParentObjectExp(expression){
        let expressionPieces = expression.split('.');
        if (expressionPieces.length<2) return '$scope';
        expressionPieces.pop();
        return expressionPieces.join('.');

    }
    getChildObjectExp(expression){
        let expressionPieces = expression.split('.');
        return expressionPieces[expressionPieces.length - 1];
    }
    getParentObj(baseObj,objExpression){
        let parentObjExpression = this.getParentObjectExp(objExpression);
        return this.expression(baseObj,parentObjExpression);
    }
}
class Scope {
    constructor(name){
        this.typeRef = SCOPE_OBJECT;
        this.name = name;
        this.props = {};
    }
    export(){
        return this.props;
    }
    getName(){
        return this.name;
    }
    addProp(componentName){
        this.props[componentName] = {};
    }
    getElement(){
        return strawberry.$getScopeElementByName(this.name);
    }
}
class Service {
    constructor(){
        this.name = '';
        this.callBackFn = '';
        this.hasBuilt = false;
        this.evaled = null;
    }
    setCallbackFn(callbackFn){
        this.callbackFn = callbackFn;
    }
    build(){
        if (!this.hasBuilt) {
            let injector = new Injector(
                this.callbackFn.toString(),
                {},
                SERVICE_OBJECT
            );
            let args = injector.resolve();
            this.evaled = this.callbackFn(...args);
            this.hasBuilt = true;
            return this.evaled;
        }
        return this.evaled;
    }
}
class StrawberryApp {
    constructor(){}
    component(componentName,callbackFn){
        let component = new Component (componentName);
        component.setCallbackFn(callbackFn);
        App.components[componentName] = component;
    }
    factory(objectName,callbackFn){
        let factory = new Factory (objectName);
        factory.setCallbackFn(callbackFn);
        App.factories[objectName] = factory;

    }
    service(objectName,callbackFn){
        let service = new Service (objectName);
        service.setCallbackFn(callbackFn);
        App.services[objectName] = service;
    }
}
/*
==========================================
Strawberry JS
Created by Ken Terrado, 2021
==========================================
*/

const App = {
    name: 'app',
    isReady: false,
    prefix: 'x',
    components: {},
    factories: {},
    services:{},
    onReady:[]
}

const SERVICE_OBJECT = 'service_object';
const FACTORY_OBJECT = 'factory_object';
const COMPONENT_OBJECT = 'component_object';
const COMPONENT_ELEMENT_ATTR = 'component';
const REPEAT_ELEMENT_ATTR = 'repeat';
const IF_ELEMENT_ATTR = 'if';
const HIDE_ELEMENT_ATTR = 'hide';
const SHOW_ELEMENT_ATTR = 'show';
const CHECK_ELEMENT_ATTR = 'check';
const STYLE_ELEMENT_ATTR = 'style';
const MODEL_ELEMENT_ATTR = 'model';
const DISABLE_ELEMENT_ATTR = 'disable';
const ENABLE_ELEMENT_ATTR = 'enable';
const CLICK_EVENT_ATTR = 'click';
const CHANGE_EVENT_ATTR = 'change';
const TOUCH_EVENT_ATTR = 'touch';
const BLOCK_ELEMENT_ATTR = 'block';

const strawberry = window.strawberry = {
    create:function(appName,callbackFn){
        if (callbackFn instanceof Function)
            callbackFn();
        App.name = appName;
        return new StrawberryApp();
    },
    $getElementsFrom:function(element,attrName){
        let resolvedAttrName = '['+App.prefix+attrName+']';
        return element.querySelectorAll(resolvedAttrName);
    },
    $getComponentFrom:function(element,componentName){
        let resolvedAttrName = '['+App.prefix+COMPONENT_ELEMENT_ATTR+'="@'+componentName+'"]';
        return element.querySelector(resolvedAttrName);
    },
    $getXValue:function(element,attrName){
        let resolvedAttrName = App.prefix+attrName;
        return element.getAttribute(resolvedAttrName);
    },
    $getAtElementFrom:function(element,atElementAttr,atElementName){
        let resolvedAtElementName = '@'+atElementName;
        let resolvedAtElementAttr = App.prefix+atElementAttr;
        let resolvedSelector = '['+resolvedAtElementAttr+'="'+resolvedAtElementName+'"]';
        return element.querySelectorAll(resolvedSelector);
    },
    $isScopeOfComponent:function(element,componentName){
        let scopeAttrName = '$'+componentName;
        let scopeAttrValue = element.getAttribute('xscope');
        return (scopeAttrValue===scopeAttrName);
    },
    $getAtElementName:function(element,attrName){
        let xValue = strawberry.$getXValue(element,attrName);
        return xValue.substring(1);
    },
    $disposeElement:function(element,comment=null){
        if (null!==element) {
            element.innerHTML = '';
            element.outerHTML  = '<!-- strawberry.js: '+element.outerHTML+' | '+comment+' -->';
        }
    },
    $resolver:function(){
        return new Resolver();
    }
};

const create_element = function(template){
    let element = document.createElement('div');
    element.innerHTML = template;
    return element;
}

const create_component = function(componentName,template){
    let element = document.createElement('div');
    //element.setAttribute(App.prefix+'component','@'+componentName);
    element.innerHTML = '<div '+App.prefix+'component="@'+componentName+'">'+template+'</div>';
    return element;
}

const bind_element = function(bindWith,bindTo){
    if (bindWith===null) return;
    while (bindWith.childNodes.length > 0) {
        bindTo.appendChild(bindWith.childNodes[0]);
    }
}

// Boot Strawberry.js
DomReady.ready(function(){

    let _app  = document.querySelector('['+App.prefix+'strawberry="'+App.name+'"]');

    if (null===_app) return;

    let template = create_element(_app.innerHTML);

    // Removing the contents of the DOM innerHTML
    _app.innerHTML = '';

    // Registering all the components in the application
    let components = strawberry.$getElementsFrom(template,COMPONENT_ELEMENT_ATTR);

    // Looping through all declared components in the DOM
    for (var i = 0; i < components.length; i++) {

        let _services = new Services();
        let componentName = _services.$component().register(components[i]);
        let component = _services.$component().render(components[i]);

        // Deactivate element when it's not declared
        if (null===component) {
            strawberry.$disposeElement(
                strawberry.$getComponentFrom(template,componentName),
                'No component declared'
            );
            continue;
        }

        // Render element when it's declared
        if (null!==strawberry.$getComponentFrom(template,componentName)) {
            strawberry.$getComponentFrom(template,componentName).innerHTML = '';
            bind_element(component,strawberry.$getComponentFrom(template,componentName));
        }
    }


    // Apends the template to the DOM
    bind_element(template,_app);

    App.isReady = true;

    for (var z = 0; z < App.onReady.length; z++) {
        App.onReady[z]();
    }

});
})();
