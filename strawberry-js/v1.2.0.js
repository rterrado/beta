(() => {
    var DomReady = window.DomReady = {};

    // Everything that has to do with properly supporting our document ready event. Brought over from the most awesome jQuery.

    var userAgent = navigator.userAgent.toLowerCase();

    // Figure out what browser is being used
    var browser = {
        version: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
        safari: /webkit/.test(userAgent),
        opera: /opera/.test(userAgent),
        msie: (/msie/.test(userAgent)) && (!/opera/.test(userAgent)),
        mozilla: (/mozilla/.test(userAgent)) && (!/(compatible|webkit)/.test(userAgent))
    };

    var readyBound = false;
    var isReady = false;
    var readyList = [];

    // Handle when the DOM is ready
    function domReady() {
        // Make sure that the DOM is not already loaded
        if (!isReady) {
            // Remember that the DOM is ready
            isReady = true;

            if (readyList) {
                for (var fn = 0; fn < readyList.length; fn++) {
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
        if (readyBound) {
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
        if (browser.msie && window == top)(function() {
            if (isReady) return;
            try {
                // If IE is used, use the trick by Diego Perini
                // http://javascript.nwbox.com/IEContentLoaded/
                document.documentElement.doScroll("left");
            } catch (error) {
                setTimeout(arguments.callee, 0);
                return;
            }
            // and execute any waiting functions
            domReady();
        })();

        if (browser.opera) {
            document.addEventListener("DOMContentLoaded", function() {
                if (isReady) return;
                for (var i = 0; i < document.styleSheets.length; i++)
                    if (document.styleSheets[i].disabled) {
                        setTimeout(arguments.callee, 0);
                        return;
                    }
                // and execute any waiting functions
                domReady();
            }, false);
        }

        if (browser.safari) {
            var numStyles;
            (function() {
                if (isReady) return;
                if (document.readyState != "loaded" && document.readyState != "complete") {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                if (numStyles === undefined) {
                    var links = document.getElementsByTagName("link");
                    for (var i = 0; i < links.length; i++) {
                        if (links[i].getAttribute('rel') == 'stylesheet') {
                            numStyles++;
                        }
                    }
                    var styles = document.getElementsByTagName("style");
                    numStyles += styles.length;
                }
                if (document.styleSheets.length != numStyles) {
                    setTimeout(arguments.callee, 0);
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
            readyList.push(function() {
                return fn.call(window, []);
            });
        }
    };

    bindReady();
    class Services {
        // Renders and appends the template as content to a certain element
        $append(scopeObj, scopeElement, template, $skip = null, $cleanUp = null) {

            // Creating a new element
            let tempElement = document.createElement('div');

            // If the scope element has to be cleaned up before template is appended
            if ($cleanUp) {
                scopeElement.innerHTML = '';
            }

            // Adding the template as innerHTML to the element
            tempElement.innerHTML = template;

            // Renders the contents of the element
            this.$render(scopeObj, tempElement, $skip);

            // Apends the elemens
            while (tempElement.childNodes.length > 0) {
                scopeElement.appendChild(tempElement.childNodes[0]);
            }

        }
        $checks(scopeObj, scopeElement) {

            let allCheckElements = scopeElement.querySelectorAll('[xcheck]');

            for (var i = 0; i < allCheckElements.length; i++) {

                let checkElement = allCheckElements[i];

                // Checked if element is locked
                if (!this.$isLocked(checkElement)) {

                    let evaluator = strawberry.$$core.$getXValue(checkElement, 'xcheck');
                    let returned = strawberry.$$core.$resolver.expression(scopeObj, evaluator);

                    // Check if the returned value is typeof boolean
                    if (typeof returned == "boolean") {
                        if (returned === true) {
                            checkElement.setAttribute('checked', '');
                        } else {
                            checkElement.removeAttribute('checked');
                        }
                    } else {
                        if (strawberry.debug) {
                            console.warn('strawberry.js: Unable to resolve element checked attribute with ' + evaluator + ', return value must be typeof Boolean');
                        }
                    }

                }

                this.$lock(checkElement);


            }

        }
        /**
         * @function $components
         * Fetches external components and appends it to the x-component attribute
         */
        $components(scopeObj, scopeElement) {

            let getAllComponentsFromGivenElement = (scopeElement, componentReferenceName) => {
                return strawberry.$$core.$getElementsFrom(scopeElement, 'xcomponent="' + componentReferenceName + '"');
            }

            /**
             * @function
             * Renders all identified component elements based on
             * the component element's xcomponent attribute value
             */
            let renderAllComponentElements = (allComponentElements, tempElement) => {
                for (var i = 0; i < allComponentElements.length; i++) {
                    let thisComponentElement = allComponentElements[i];
                    // Apends the elemens
                    while (tempElement.childNodes.length > 0) {
                        thisComponentElement.appendChild(tempElement.childNodes[0]);
                    }
                }
            }

            // Selecting all elements referenced by attribute attribute xcomponent
            let componentElements = strawberry.$$core.$getElementsFrom(scopeElement, 'xcomponent');

            // Looping through all the identified element
            for (var i = 0; i < componentElements.length; i++) {

                let componentElement = componentElements[i];

                // Getting the xcomponent attribute value to be served as referenced
                let componentReference = strawberry.$$core.$getXValue(componentElement, 'xcomponent');

                /** Component elements can have children by default. If this is the case,
                    Strawberry will not attempt to load any external component **/
                if (componentElement.innerHTML.trim() !== '') {
                    // Saves component element to the template
                    scopeObj.$templates[componentReference] = componentElement.innerHTML;
                    return;
                }

                /**
                 * When component elements are empty, Strawberry.js will default to
                 * try to load the content externally based on the value given to
                 * the element's x-component attribute
                 */
                let path = strawberry.$$core.$resolver.expression(scopeObj, componentReference);

                /**
                 * @var path must be returned as a type of string
                 * With other data types, the path cannot be considered
                 * as a valid url to load the component from
                 */
                if (typeof path !== 'string') {
                    if (strawberry.debug) {
                        console.warn('strawberry.js: Unable to resolve component path: $scope.' + componentReference + ', typeof string required');
                    }
                }

                this.$public().$http().init(scopeObj).get(path, (response) => {

                    /**
                     * NOTE: Response can either be text returned by the URL
                     * regardless of the HTTP status code
                     */

                    let tempElement = document.createElement('div');

                    // Adding the template as innerHTML to the element
                    tempElement.innerHTML = response;

                    // Renders the contents of the element
                    this.$render(scopeObj, tempElement);

                    let allComponentElements = getAllComponentsFromGivenElement(scopeElement, componentReference);

                    if (allComponentElements.length === 0) {
                        let scopeElements = strawberry.$$core.$getScope(scopeObj.$name);
                        for (var i = 0; i < scopeElements.length; i++) {
                            let scopeElement = scopeElements[i];
                            let allComponentElements = getAllComponentsFromGivenElement(scopeElement, componentReference);
                            renderAllComponentElements(allComponentElements, tempElement);
                        }
                        this.$lock(componentElement);
                        return;
                    }

                    renderAllComponentElements(allComponentElements, tempElement);

                    this.$lock(componentElement);

                });

            }
        }
        constructor(app = null) {
            this.app = app;
        }
        $disablers(scopeObj, scopeElement) {

            // Finds all elements with data-disable
            let allDisabledInputs = scopeElement.querySelectorAll('[xdisable]');

            // Looping through form elements
            for (var i = 0; i < allDisabledInputs.length; i++) {

                let disabledElement = allDisabledInputs[i];

                if (!disabledElement.disabled) {
                    disabledElement.disabled = true;
                }

            }

        }
        $events(scopeObj, scopeElement) {

            let addEvent = (scopeObj, eventElement, funcExpression, eventType) => {

                if (strawberry.$$core.$resolver.getResolveType(funcExpression) !== 'function') {
                    if (strawberry.debug) {
                        console.warn('strawberry.js: Unable to add click event, $scope.' + funcExpression + ' must typeof a function');
                    }
                }

                eventElement.addEventListener(eventType, () => {
                    strawberry.$$core.$resolver.expression(scopeObj, funcExpression, eventElement);
                });

                this.$lockEvent(eventElement, eventType);

            }


            // Finds all elements with data-click attribute
            let allClickableElements = scopeElement.querySelectorAll('[xclick]');

            // Looping through the clickable elements
            for (let i = 0; i < allClickableElements.length; i++) {

                let clickableElement = allClickableElements[i];

                // Takes the function name referenced for the click event
                let clickFunction = strawberry.$$core.$getXValue(clickableElement, 'xclick');

                if (!this.$isEventLocked(clickableElement, 'click')) {
                    addEvent(scopeObj, clickableElement, clickFunction, 'click');
                }

            }

            let allChangeableElement = scopeElement.querySelectorAll('[xchange]');

            // Looping through the change elements
            for (let i = 0; i < allChangeableElement.length; i++) {

                let changeElement = allChangeableElement[i];

                // Takes the function name referenced for the change event
                let clickFunction = strawberry.$$core.$getXValue(changeElement, 'xchange');

                if (!this.$isEventLocked(changeElement, 'change')) {
                    addEvent(scopeObj, changeElement, clickFunction, 'change');
                }

            }

        }
        $hides(scopeObj, scopeElement) {

            // Finds all elements with IF conditionals
            let allHidableElements = scopeElement.querySelectorAll('[xhide]');

            // Looping through conditional elements
            for (var i = 0; i < allHidableElements.length; i++) {

                let hidableElement = allHidableElements[i];

                if (!this.$isLocked(hidableElement)) {

                    let hidableName = strawberry.$$core.$getXValue(hidableElement, 'xhide');

                    scopeObj.$hidden[hidableName] = {
                        template: hidableElement.innerHTML,
                        state: false
                    }

                    hidableElement.innerHTML = '';

                    this.$lock(hidableElement);

                }

            }

        }
        $ifs(scopeObj, scopeElement) {

            // Finds all elements with IF conditionals
            let allElemWithIfConditionals = scopeElement.querySelectorAll('[xif]');

            // Looping through conditional elements
            for (var i = 0; i < allElemWithIfConditionals.length; i++) {

                let conditionalElement = allElemWithIfConditionals[i];

                if (!this.$isLocked(conditionalElement)) {

                    let argument = strawberry.$$core.$getXValue(conditionalElement, 'xif');

                    let resolved = strawberry.$$core.$resolver.expression(scopeObj, argument.trim());

                    if (typeof resolved == "boolean") {
                        if (!resolved) {
                            conditionalElement.innerHTML = '';
                            conditionalElement.outerHTML = '<!-- strawberry.js: ' + conditionalElement.outerHTML + ' -->';
                        }
                    } else {
                        if (strawberry.debug) {
                            console.warn('strawberry.js: Unable to resolve "if" conditional with argument "' + argument + '", return value must be typeof Boolean');
                        }
                    }

                    this.$lock(conditionalElement);

                }

            }


        }
        $lock(element) {
            element.setAttribute('xset', 'scope');
        }

        $isLocked(element) {
            if (element.getAttribute('xset') === null) {
                return false;
            }
            return true;
        }

        $isEventLocked(element, eventName) {
            let result = false;
            let eventsAdded = element.getAttribute('xevent');
            if (eventsAdded === null) return false;
            let allEvents = eventsAdded.split(',');
            for (var i = 0; i < allEvents.length; i++) {
                if (eventName === allEvents[i]) {
                    result = true;
                }
            }
            return result;
        }

        $lockEvent(element, eventName) {
            let eventsAdded = element.getAttribute('xevent');
            if (eventsAdded === null) {
                element.setAttribute('xevent', eventName);
                return;
            }
            let allEvents = eventsAdded.split(',');
            for (var i = 0; i < allEvents.length; i++) {
                if (eventName !== allEvents[i]) {
                    allEvents.push(eventName);
                }
            }
            element.setAttribute('xevent', allEvents.join(','));
        }
        $models(scopeObj, scopeElement) {

            let assignModelObjValue = (scopeObj, modelExpression, modelValue) => {
                let parentObj = strawberry.$$core.$resolver.getParentObj(scopeObj, modelExpression);
                let childObjExpression = strawberry.$$core.$resolver.getChildObjectExp(modelExpression);
                if (parentObj === undefined) {
                    if (strawberry.debug) {
                        console.error('strawberry.js: Unable to add member property "' + modelExpression + '" to $scope.' + parentObjExpression + ', object is undefined');
                    }
                } else {
                    parentObj[childObjExpression] = modelValue;
                }
            }

            let assignModelElementState = (modelElement, modelState, modelExpression) => {
                if (typeof modelState == "boolean") {
                    if (modelState === true) {
                        modelElement.setAttribute('checked', '');
                    } else {
                        modelElement.removeAttribute('checked');
                    }
                } else {
                    if (strawberry.debug) {
                        console.warn('strawberry.js: Unable to resolve element checked attribute with ' + modelExpression + ', return value must be typeof Boolean');
                    }
                }
            }

            let allModelElements = scopeElement.querySelectorAll('[xmodel]');

            for (var i = 0; i < allModelElements.length; i++) {
                let modelElement = allModelElements[i];
                let modelExpression = strawberry.$$core.$getXValue(modelElement, 'xmodel');

                // Different behavior for input as it will get the value
                if (modelElement.tagName === 'INPUT' || modelElement.tagName === 'SELECT') {

                    if (modelElement.type === 'radio') {

                        let resolvedObject = strawberry.$$core.$resolver.expression(scopeObj, modelExpression);

                        if (resolvedObject === undefined) {
                            assignModelObjValue(scopeObj, modelExpression, false);
                        } else {
                            assignModelElementState(modelElement, resolvedObject, modelExpression);
                        }

                        modelElement.addEventListener('change', () => {
                            assignModelObjValue(scopeObj, modelExpression, modelElement.checked);
                        });
                    } else if (modelElement.type === 'checkbox') {
                        let resolvedObject = strawberry.$$core.$resolver.expression(scopeObj, modelExpression);
                        if (resolvedObject === undefined) {
                            assignModelObjValue(scopeObj, modelExpression, false);
                        } else {
                            assignModelElementState(modelElement, resolvedObject, modelExpression);
                        }
                        modelElement.addEventListener('change', () => {
                            assignModelObjValue(scopeObj, modelExpression, modelElement.checked);
                        });
                    } else {

                        let resolvedObject = strawberry.$$core.$resolver.expression(scopeObj, modelExpression);
                        if (resolvedObject === undefined) {
                            assignModelObjValue(scopeObj, modelExpression, modelElement.value);
                        } else {
                            modelElement.value = resolvedObject;
                        }

                        // Add change event listener to input
                        modelElement.addEventListener('change', () => {
                            assignModelObjValue(scopeObj, modelExpression, modelElement.value);
                        });

                    }
                }
            }

        }
        $patches(scopeObj, scopeElement) {

            // Finds elements with xpatch attribute
            let allPatchableElements = scopeElement.querySelectorAll('[xpatch]');

            for (var i = 0; i < allPatchableElements.length; i++) {

                let patchableElement = allPatchableElements[i];

                let patchName = strawberry.$$core.$getXValue(patchableElement, 'xpatch');

                // Registers the template:
                scopeObj.$patchables[patchName] = patchableElement.innerHTML;

            }

        }
        $placeholders(scopeObj, scopeElement) {

            let regularExpression = /(?<=\{{).+?(?=\}})/g;

            let template = scopeElement.innerHTML;

            // Match all regex in the innerHTML string of the element
            let allMatchedData = template.match(regularExpression);

            // If there is a match regex
            if (allMatchedData !== null) {

                for (var i = 0; i < allMatchedData.length; i++) {

                    let resolvedExpression = strawberry.$$core.$resolver.expression(scopeObj, allMatchedData[i].trim());
                    if (resolvedExpression === undefined) {
                        resolvedExpression = '';
                    }
                    template = template.replace('{{' + allMatchedData[i] + '}}', resolvedExpression);
                }
            }

            scopeElement.innerHTML = template;

        }
        // Renders the element based on the values of the scope object
        $render(scopeObj, renderElement, skip = null) {

            // Temporarily hides the given scope element
            renderElement.style.opacity = '0';

            this.$templates(scopeObj, renderElement);
            this.$components(scopeObj, renderElement);
            this.$patches(scopeObj, renderElement);
            this.$switchers().find(scopeObj, renderElement);
            this.$repeats(scopeObj, renderElement);
            this.$ifs(scopeObj, renderElement);
            this.$hides(scopeObj, renderElement);
            this.$shows(scopeObj, renderElement);
            this.$placeholders(scopeObj, renderElement);
            this.$checks(scopeObj, renderElement);
            this.$styles(scopeObj, renderElement);
            this.$models(scopeObj, renderElement);
            this.$disablers(scopeObj, renderElement);
            this.$requires(scopeObj, renderElement);

            if (skip !== 'events') {
                this.$events(scopeObj, renderElement);
            }

            renderElement.style.opacity = '1';
        }
        $repeats(scopeObj, scopeElement) {

            let getReferenceName = (expression) => {
                if (expression.includes('until')) {
                    return '$$index';
                }
                return expression.split('as')[0].trim();
            }
            let getAliasName = (expression) => {
                if (expression.includes('until')) {
                    return expression.split('until')[1].trim();
                }
                return expression.split('as')[1].trim();
            }

            // Finds all elements with repeatable elements
            let repeatElements = strawberry.$$core.$getElementsFrom(scopeElement, 'xrepeat');

            // Loop through repeatable elements
            for (var i = 0; i < repeatElements.length; i++) {

                let repeatElement = repeatElements[i];

                if (!this.$isLocked(repeatElement)) {

                    // Takes in all content of repeatable element
                    let htmlTemplate = repeatElement.innerHTML;

                    repeatElement.innerHTML = '';

                    let expression = strawberry.$$core.$getXValue(repeatElement, 'xrepeat');

                    let referenceObjName = getReferenceName(expression);

                    if (referenceObjName === '$$index') {

                        // This creates a new object that we can loop through
                        scopeObj.$$index = new Object;

                        let repeatables = getAliasName(expression);

                        let repetitions = strawberry.$$core.$resolver.expression(scopeObj, repeatables);

                        if (!isNaN(parseFloat(repetitions)) && !isNaN(repetitions - 0)) {
                            for (var i = 0; i < repetitions; i++) {
                                scopeObj.$$index['props' + i] = new Object;
                            }
                        }

                    }

                    // Resolves the repeatable object according to the left hand expression
                    // in the attribute xrepeat="LEFT as RIGHT"
                    let repeatableObject = strawberry.$$core.$resolver.expression(scopeObj, referenceObjName);

                    if (repeatableObject !== undefined) {

                        let i = 0;

                        for (const [key, value] of Object.entries(repeatableObject)) {
                            let tempObj = {};
                            let aliasObjName = getAliasName(expression);
                            tempObj[aliasObjName] = value;
                            tempObj.$parent = scopeObj;
                            tempObj.$index = i;
                            //tempObj.$parent.$child = tempObj;
                            this.$append(tempObj, repeatElement, htmlTemplate, 'events');
                            i++;
                        }

                    } else {
                        if (strawberry.debug) {
                            console.warn('strawberry.js: Unable to repeat ' + expression + ', cannot resolve $scope.' + referenceObjName);
                        }
                    }

                }

            }


        }
        $requires(scopeObj, scopeElement) {

            // Turns a string in array notation into an actual array
            let arrify = (stx) => {
                return JSON.parse(stx.replace(/'/g, '"'));
            }

            // Finds all elements with xrequired attribute
            let allWithRequireElements = scopeElement.querySelectorAll('[xrequire]');

            for (var i = 0; i < allWithRequireElements.length; i++) {
                let withRequireElement = allWithRequireElements[i];
                let requireStx = strawberry.$$core.$getXValue(withRequireElement, 'xrequire');
                let required = arrify(requireStx);
                let hasMetRequired = required.every(element => {
                    return scopeObj.$deps.includes(element);
                });
                if (!hasMetRequired) {
                    withRequireElement.innerHTML = '';
                    withRequireElement.outerHTML = '<!-- strawberry.js: ' + withRequireElement.outerHTML + ' -->';
                }
            }

        }
        $shows(scopeObj, scopeElement) {
            // Finds all elements with IF conditionals
            let allShowableElements = scopeElement.querySelectorAll('[xshow]');
            // Looping through conditional elements
            for (var i = 0; i < allShowableElements.length; i++) {
                let showableElement = allShowableElements[i];
                // Check if element is locked
                if (!this.$isLocked(showableElement)) {
                    // Get the name of the showable element
                    let showableName = strawberry.$$core.$getXValue(showableElement, 'xshow');
                    // Record showable entry the scope's $hidden object
                    scopeObj.$hidden[showableName] = {
                        template: showableElement.innerHTML,
                        state: true
                    }
                    this.$lock(showableElement);
                }
            }
        }
        $styles(scopeObj, scopeElement) {

            let allStyleElements = scopeElement.querySelectorAll('[xstyle]');

            for (var i = 0; i < allStyleElements.length; i++) {
                let styleElement = allStyleElements[i];

                // Checked if element is locked
                if (!this.$isLocked(styleElement)) {
                    let evaluator = strawberry.$$core.$getXValue(styleElement, 'xstyle');
                    let returned = strawberry.$$core.$resolver.expression(scopeObj, evaluator).trim();
                    if (returned !== null && returned !== '') {
                        styleElement.classList.add(returned);
                    }
                }

                this.$lock(styleElement);

            }

        }
        $switchers(scopeObj, scopeElement) {

            return {

                find: (scopeObj, scopeElement) => {

                    // Finds all elements with SWITCH conditionals
                    let allSwitchableElements = scopeElement.querySelectorAll('[xswitch]');

                    // Looping through switch elements
                    for (var i = 0; i < allSwitchableElements.length; i++) {

                        let switchableElement = allSwitchableElements[i];

                        let switchName = strawberry.$$core.$getXValue(switchableElement, 'xswitch');

                        // Registers a new switch object in the scopeObj' $switch property
                        scopeObj.$switchers[switchName] = new Object;

                        // Registers when element
                        this.$switchers().when(scopeObj, switchableElement, switchName);

                        // Registers default element
                        this.$switchers().default(scopeObj, switchableElement, switchName);

                    }

                },

                when: (scopeObj, switchableElement, switchName) => {

                    let allSwitchWhenElements = switchableElement.querySelectorAll('[xswitch-when]');

                    // Looping through switch when elements
                    for (var k = 0; k < allSwitchWhenElements.length; k++) {

                        // Take each switch when element
                        let switchWhenElement = allSwitchWhenElements[k];
                        let switchWhenName = strawberry.$$core.$getXValue(switchWhenElement, 'xswitch-when');

                        // Registers when switch element
                        scopeObj.$switchers[switchName][switchWhenName] = {
                            '$html': switchWhenElement.innerHTML,
                            '$onSwitch': false
                        }

                        switchWhenElement.innerHTML = '';

                    }
                },

                default: (scopeObj, switchableElement, switchName) => {

                    let allSwitchDefaultElements = switchableElement.querySelectorAll('[xswitch-default]');

                    // Looping through switch when elements
                    for (var k = 0; k < allSwitchDefaultElements.length; k++) {

                        let switchDefaultElement = allSwitchDefaultElements[k];

                        scopeObj.$switchers[switchName]['$default'] = {
                            '$html': switchDefaultElement.innerHTML,
                            '$onSwitch': true
                        }

                    }
                },

                $on: (scopeObj, switchName, switchWhenDefName) => {

                    let getSwitchWhenDefElement = (switchName, switchWhenDefName) => {

                        let switchableElement = document.querySelector('[xswitch="' + switchName + '"]');

                        if (switchWhenDefName !== '$default') {
                            return switchableElement.querySelector('[xswitch-when="' + switchWhenDefName + '"]');
                        }

                        return switchableElement.querySelector('[xswitch-default]');

                    }

                    // Checking if such object exists
                    if (typeof scopeObj.$switchers[switchName][switchWhenDefName] !== 'undefined') {

                        let switchWhenDefObj = scopeObj.$switchers[switchName][switchWhenDefName];

                        let elementSwitch = scopeObj.$switchers[switchName][switchWhenDefName];

                        if (!switchWhenDefObj.$onSwitch) {

                            // Hides the current switched element
                            for (const [key, value] of Object.entries(scopeObj.$switchers[switchName])) {

                                if (key !== switchWhenDefName) {
                                    getSwitchWhenDefElement(switchName, key).innerHTML = '';
                                    value.$onSwitch = false;
                                } else {

                                    // Copies the current selected element
                                    let tempValueHtml = value.$html;

                                    let tempHtml = document.createElement('div');

                                    tempHtml.innerHTML = value.$html;

                                    // Renders the current selected element
                                    this.$render(scopeObj, tempHtml);

                                    while (tempHtml.childNodes.length > 0) {
                                        getSwitchWhenDefElement(switchName, switchWhenDefName).appendChild(tempHtml.childNodes[0]);
                                        value.$onSwitch = true;
                                    }

                                    value.$html = tempValueHtml;

                                }
                            }
                        }
                    }

                }

            }

        }
        /**
         * @function $templates
         * Fetches external components and appends it to the x-component attribute
         */
        $templates(scopeObj, scopeElement) {

            let templateElements = strawberry.$$core.$getElementsFrom(scopeElement, 'xtemplate');

            for (var i = 0; i < templateElements.length; i++) {
                let templateElement = templateElements[i];
                let templateReference = strawberry.$$core.$getXValue(templateElement, 'xtemplate');
                let resolvedTemplate = strawberry.$$core.$resolver.expression(scopeObj, templateReference, templateElement);
                let tempElement = document.createElement('div');
                // Adding the template as innerHTML to the element
                if (undefined === resolvedTemplate) {
                    resolvedTemplate = '';
                }
                tempElement.innerHTML = resolvedTemplate;
                // Renders the contents of the element
                this.$render(scopeObj, tempElement, 'events');
                while (tempElement.childNodes.length > 0) {
                    templateElement.appendChild(tempElement.childNodes[0]);
                }
                this.$lock(templateElement);

                //this.$append(scopeObj,templateElement,resolvedTemplate);
            }

        }
        $public() {
            return {
                $component: (componentName = null) => {
                    if (componentName === null) {
                        return {
                            init: ($scope, service) => {
                                this.$scope = $scope;
                                return service;
                            }
                        }
                    }

                    let e = this.$scope.$app;

                    if (this.$scope.$templates.hasOwnProperty(componentName)) {

                        // Finds all component element
                        let allComponentElements = strawberry.$$core.$getElementsFromScope(this.$scope.$name, 'xcomponent="' + componentName + '"');

                        console.log(allComponentElements);

                        for (var i = 0; i < allComponentElements.length; i++) {

                            let template = this.$scope.$templates[componentName];
                            let componentElement = allComponentElements[i];
                            let element = new Element(componentElement);
                            element.update = () => {
                                componentElement.innerHTML = '';
                                window[e].$scopes[this.$scope.$name].$services.$append(this.$scope, componentElement, template);
                            }
                            return element;

                        }

                        return;

                    }

                },
                $disable: (enableName = null, isEnable = null) => {
                    if (enableName === null) {
                        return {
                            init: ($scope, service) => {
                                this.$scope = $scope;
                                return service;
                            }
                        }
                    }

                    let e = this.$scope.$app;
                    let willDisable = isEnable ?? true;
                    enableName = '@' + enableName;

                    if (willDisable) {
                        let allDisabledInputs = strawberry.$$core.$getElementsFromScope(this.$scope.$name, 'xdisable="' + enableName + '"');
                        for (var i = 0; i < allDisabledInputs.length; i++) {
                            let disabledInput = allDisabledInputs[i];
                            if (!disabledInput.disabled) {
                                disabledInput.disabled = true;
                            }
                        }
                    } else {
                        let enableService = window[e].$scopes[this.$scope.$name].$services.$public()['$enable'];
                        let $enable = enableService().init(this.$scope, enableService);
                        $enable(enableName);
                    }

                },
                $enable: (enableName = null, isEnable = null) => {
                    if (enableName === null) {
                        return {
                            init: ($scope, service) => {
                                this.$scope = $scope;
                                return service;
                            }
                        }
                    }

                    let e = this.$scope.$app;
                    let willEnable = isEnable ?? true;
                    enableName = '@' + enableName;

                    if (willEnable) {
                        let allDisabledInputs = strawberry.$$core.$getElementsFromScope(this.$scope.$name, 'xdisable="' + enableName + '"');
                        for (var i = 0; i < allDisabledInputs.length; i++) {
                            let disabledInput = allDisabledInputs[i];
                            if (disabledInput.disabled) {
                                disabledInput.disabled = false;
                            }
                        }
                    } else {
                        let disableService = window[e].$scopes[this.$scope.$name].$services.$public()['$disable'];
                        let $disable = disableService().init(this.$scope, disableService);
                        $disable(enableName);
                    }

                },
                $hide: (elementName = null) => {
                    if (elementName === null) {
                        return {
                            init: ($scope, service) => {
                                this.$scope = $scope;
                                return service;
                            }
                        }
                    }

                    elementName = '@' + elementName;

                    let hide = (element) => {
                        // Check if the current state of the element is true (means SHOWING)
                        if (this.$scope.$hidden[elementName].state) {
                            element.innerHTML = '';
                            // Modifies the state of the hidable element
                            this.$scope.$hidden[elementName].state = false;
                        }
                    }

                    // Finds all element named under the xshow attribute
                    let allShowElements = strawberry.$$core.$getElementsFromScope(this.$scope.$name, 'xshow="' + elementName + '"');
                    for (var i = 0; i < allShowElements.length; i++) {
                        hide(allShowElements[i]);
                    }

                    // Finds all element named under the xhide attribute
                    let allHideElements = strawberry.$$core.$getElementsFromScope(this.$scope.$name, 'xhide="' + elementName + '"');
                    for (var i = 0; i < allHideElements.length; i++) {
                        hide(allHideElements[i]);
                    }

                },
                $http: () => {
                    return {
                        init: (scopeObj) => {
                            return {
                                get: (aUrl, aCallback) => {
                                    var anHttpRequest = new XMLHttpRequest();
                                    anHttpRequest.onreadystatechange = function() {
                                        if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                                            aCallback(anHttpRequest.responseText);
                                    }
                                    anHttpRequest.open('GET', aUrl, true);
                                    anHttpRequest.send(null);
                                }
                            }
                        }
                    }
                },
                $patch: (patchName = null, templateSrc = null) => {
                    if (patchName === null) {
                        return {
                            init: ($scope, service) => {
                                this.$scope = $scope;
                                return service;
                            }
                        }
                    }

                    let e = this.$scope.$app;

                    patchName = '@' + patchName;

                    if (this.$scope.$patchables.hasOwnProperty(patchName)) {

                        // Finds all patchable element
                        let allPatchableElements = strawberry.$$core.$getElementsFromScope(this.$scope.$name, 'xpatch="' + patchName + '"');

                        // Looping through all patchable elements, registers, the hides it
                        for (var i = 0; i < allPatchableElements.length; i++) {

                            let patchableElement = allPatchableElements[i];
                            let template = templateSrc ?? this.$scope.$patchables[patchName];

                            patchableElement.innerHTML = '';
                            window[e].$scopes[this.$scope.$name].$services.$append(this.$scope, patchableElement, template);

                        }

                        return;

                    }

                    if (this.$scope.$templates.hasOwnProperty(patchName)) {

                        // Finds all component element
                        let allComponentElements = strawberry.$$core.$getElementsFromScope(this.$scope.$name, 'xcomponent="' + patchName + '"');

                        for (var i = 0; i < allComponentElements.length; i++) {

                            let componentElement = allComponentElements[i];
                            componentElement.innerHTML = '';

                            let template = this.$scope.$templates[patchName];
                            window[e].$scopes[this.$scope.$name].$services.$append(this.$scope, componentElement, template);

                        }

                        return;

                    }

                },
                $show: (elementName = null) => {
                    if (elementName === null) {
                        return {
                            init: ($scope, service) => {
                                this.$scope = $scope;
                                return service;
                            }
                        }
                    }

                    let e = this.$scope.$app;
                    elementName = '@' + elementName;

                    let show = (element) => {
                        // Check if the current state of the element is false (means HIDDEN)
                        if (!this.$scope.$hidden[elementName].state) {
                            window[e].$scopes[this.$scope.$name].$services.$append(this.$scope, element, this.$scope.$hidden[elementName].template, null, true);
                            // Modifies the state of the element
                            this.$scope.$hidden[elementName].state = true;
                        }
                    }

                    // Finds all element named under the xhide attribute
                    let allHideElements = strawberry.$$core.$getElementsFromScope(this.$scope.$name, 'xhide="' + elementName + '"');
                    for (var i = 0; i < allHideElements.length; i++) {
                        show(allHideElements[i]);
                    }

                    // Finds all element named under the xshow attribute
                    let allShowElements = strawberry.$$core.$getElementsFromScope(this.$scope.$name, 'xshow="' + elementName + '"');
                    for (var i = 0; i < allShowElements.length; i++) {
                        show(allShowElements[i]);
                    }

                },
                $switch: (switchName = null) => {
                    if (switchName === null) {
                        return {
                            init: ($scope, service) => {
                                this.$scope = $scope;
                                return service;
                            }
                        }
                    }
                    let e = this.$scope.$app;
                    switchName = '@' + switchName;
                    return {
                        when: (whenName) => {
                            window[e].$scopes[this.$scope.$name].$services.$switchers().$on(this.$scope, switchName, whenName);
                        },
                        default: () => {
                            window[e].$scopes[this.$scope.$name].$services.$switchers().$on(this.$scope, switchName, '$default');
                        }
                    }

                },
                $toggle: (hidableName = null) => {
                    if (hidableName === null) {
                        return {
                            init: ($scope, service) => {
                                this.$scope = $scope;
                                return service;
                            }
                        }
                    }

                    let e = this.$scope.$app;
                    hidableName = '@' + hidableName;

                    let hideService = window[e].$scopes[this.$scope.$name].$services.$public()['$hide'];
                    let $hide = hideService().init(this.$scope, hideService);

                    let showService = window[e].$scopes[this.$scope.$name].$services.$public()['$show'];
                    let $show = showService().init(this.$scope, showService);

                    // Check if the name of the hidden element is registered
                    if (this.$scope.$hidden.hasOwnProperty(hidableName)) {
                        if (this.$scope.$hidden[hidableName].state) {
                            // Element is currently being SHOWN
                            this.$scope.$togglers[hidableName] = false;
                            $hide(hidableName);

                        } else {
                            // Element is current being HIDDEN
                            this.$scope.$togglers[hidableName] = true;
                            $show(hidableName);
                        }
                    } else {
                        if (strawberry.debug) {
                            console.warn('strawberry.js: Unable to toggle "' + hidableName + '", element do not exist');
                        }
                    }




                }
            }
        }
    }
    class Element {
        constructor(element, treeCount = null) {
            this.$element = element;
            if (treeCount == null) {
                treeCount = 1;
            }
            if (treeCount < 4 && element.parentElement !== null) {
                this.$parent = new Element(element.parentElement, treeCount++);
            }
        }
        get() {
            return this.$element;
        }
        setXAttribute(attrName, attrValue) {
            this.$element.setAttribute('x' + attrName, attrValue);
        }
        getXValue(attrName) {
            return strawberry.$$core.$getXValue(this.$element, 'x' + attrName);
        }
        referenceScope(scopeObject) {
            this.$element.scopeOf = scopeObject;
        }
        addClass(className) {
            this.$element.classList.add(className);
        }
        listClass() {
            return this.$element.className.split(' ');
        }
        removeClass(className) {
            this.$element.classList.remove(className);
        }
        toggleClass(className) {
            let classes = this.listClass();
            for (var i = 0; i < classes.length; i++) {
                let clas = classes[i];
                if (clas === className) {
                    this.removeClass(className);
                } else {
                    this.addClass(className);
                }
            }
        }
    }
    class Injector {
        constructor(funcString) {
            this.funcString = funcString.toString();
            this.args = [];
        }
        scope(scopeObj) {
            this.scopeObj = scopeObj;
            return this;
        }
        resolve() {

            // Set regex to match
            let funcExpression = /(?<=\().+?(?=\))/g;
            let matchedFunc = this.funcString.match(funcExpression);

            // If the function argument is empty, just return empty array
            if (matchedFunc === null) {
                return [];
            }

            let invalidExpressions = /[(={})]/g;
            if (invalidExpressions.test(matchedFunc[0])) {
                return [];
            }

            // Match all regex in the innerHTML string of the element
            let argumentExpression = matchedFunc[0];
            let allArguments = argumentExpression.split(',');
            let argObj = new Array;

            for (var i = 0; i < allArguments.length; i++) {
                let arg = allArguments[i].trim();

                if (arg === '$scope') {
                    argObj.push(this.scopeObj);
                    continue;
                }
                if (arg.charAt(0) === '$') {

                    let service = window[strawberry.$app].$scopes[this.scopeObj.$name].$services.$public()[arg];

                    if (typeof service === 'function') {
                        argObj.push(service().init(this.scopeObj, service));
                        continue;
                    }
                    argObj.push(() => {
                        console.error('strawberry.js: Injector cannot resolve ' + arg + ' as a function');
                    });
                    continue;
                }
                if (strawberry.$factory.hasOwnProperty(arg)) {
                    argObj.push(strawberry.$factory[arg]);
                    this.args.push(arg);
                    continue;
                }
                if (strawberry.$service.hasOwnProperty(arg)) {
                    let func = strawberry.$service[arg];
                    if (func instanceof Function) {
                        let injector = new Injector(func);
                        let args = injector.scope(this.scopeObj).resolve();
                        let returnedObj = func(...args);
                        argObj.push(returnedObj);
                    } else {
                        argObj.push({});
                    }
                    this.args.push(arg);
                    continue;
                }
                if (strawberry.debug) {
                    console.error('strawberry.js: Injector cannot resolve "' + arg + '" as an object');
                }
            }
            return argObj;
        }
        getResolvedArgs() {
            return this.args;
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
        expression(baseObj, expression, element = null) {

            // We first determine what type of expression we will need to resolve.
            // This will be based on the structure of the operation
            let resolveType = this.getResolveType(expression);

            // This is where the actual resolve process takes place
            return this.resolve(baseObj, expression, resolveType, element);

        }

        /**
         * @method getResolveType
         * Determines the type of an expression
         * @param string expression
         * @returns type of expression
         *
         * @NOTE: the expression should always have to be a string!
         */
        getResolveType(expression) {
            if (/^'.*'$/.test(expression)) return 'string';
            if (!isNaN(expression)) return 'number';
            if (expression.includes('(')) return 'function';
            if (expression.includes('==')) return 'boolOperation';
            if (expression.includes('is ')) return 'boolOperation';
            if (expression.includes('+') || expression.includes('-') || expression.includes('/') || expression.includes('*') || expression.includes('%')) {
                return 'operation';
            }
            if (expression == 'false' || expression == 'true' || expression == 'null') {
                return 'boolean';
            }
            return 'object';
        }
        resolve(scopeObj, expression, resolveType, element = null) {

            switch (resolveType) {

                // CASE: STRING
                case 'string':
                    return expression.slice(1, -1);
                    break;

                case 'boolean':
                    if (expression == 'true') return true;
                    if (expression == 'false') return false;
                    if (expression == 'null') return null;
                    break;

                    // CASE: OBJECT
                case 'object':
                    return this.evalObject(scopeObj, expression);
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
                    let invokeFunction = (refObject, argScope, functionExpression) => {

                        // Parses function structure
                        let splitfunctionExpression = functionExpression.match(/\(([^)]+)\)/);
                        let funcStruct = functionExpression.split('(');
                        let funcName = funcStruct[0];

                        // If function has an argument
                        if (splitfunctionExpression !== null) {

                            // Function argument holder
                            var argObj = new Array;

                            let splitFunctionArguments = splitfunctionExpression[1].split(',');
                            for (var i = 0; i < splitFunctionArguments.length; i++) {
                                argObj.push(this.expression(argScope, splitFunctionArguments[i]));
                            }

                            if (element !== null) {
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
                        if (element !== null) {

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
                    if (expressionTest.length > 1) {

                        let refObject = this.expression(scopeObj, this.getParentObjectExp(funcStruct[0]));

                        let funcExpression = expression.split('.').slice(((expressionTest.length) - 1)).join('.');

                        return invokeFunction(refObject, scopeObj, funcExpression);
                    }

                    if (!scopeObj.hasOwnProperty(funcStruct[0])) {
                        if (strawberry.debug) {
                            console.warn('strawberry.js: Unable to resolve $scope.' + expression);
                        }
                        return '';
                    }

                    return invokeFunction(scopeObj, scopeObj, expression);

                    break;

                    // CASE: BOOLEAN OPERATION
                case 'boolOperation':

                    let isTheSame = (left, right) => {
                        return (left === right);
                    }

                    let isNotTheSame = (left, right) => {
                        return (left !== right);
                    }

                    if (expression.includes('!==')) {
                        let comparables = expression.split('!==');
                        return isNotTheSame(this.expression(scopeObj, comparables[0].trim()), this.expression(scopeObj, comparables[1].trim()));
                    } else if (expression.includes('==')) {
                        let comparables = expression.split('==');
                        return isTheSame(this.expression(scopeObj, comparables[0].trim()), this.expression(scopeObj, comparables[1].trim()));
                    } else if (expression.includes('is not ')) {
                        let comparables = expression.split('is not');
                        return isNotTheSame(this.expression(scopeObj, comparables[0].trim()), this.expression(scopeObj, comparables[1].trim()));
                    } else if (expression.includes('is ')) {
                        let comparables = expression.split('is');
                        return isTheSame(this.expression(scopeObj, comparables[0].trim()), this.expression(scopeObj, comparables[1].trim()));
                    } else {

                    }

                    break;

                case 'number':
                    return Number(expression);
                    break;

                case 'operation':

                    let finalExpression = expression;

                    let operations = ['+', '-', '*', '/', '%'];
                    for (var i = 0; i < operations.length; i++) {

                        if (expression.includes(operations[i])) {
                            let exp = expression.split(operations[i]);
                            let left = this.expression(scopeObj, exp[0].trim());
                            var right = this.expression(scopeObj, exp[1].trim());
                            finalExpression = left + operations[i] + right;
                        }
                    }

                    return eval(finalExpression);
                    break;
            }
        }
        evalObject(scopeObj, objectExpression) {
            if (objectExpression === '$scope') {
                return scopeObj;
            }
            return objectExpression.split(".").reduce(function(o, x) {
                if (o === undefined) {
                    return;
                }
                if (o[x] === undefined) {
                    return;
                }
                return o[x];
            }, scopeObj);
        }
        getParentObjectExp(expression) {
            let expressionPieces = expression.split('.');
            if (expressionPieces.length < 2) return '$scope';
            expressionPieces.pop();
            return expressionPieces.join('.');

        }
        getChildObjectExp(expression) {
            let expressionPieces = expression.split('.');
            return expressionPieces[expressionPieces.length - 1];
        }
        getParentObj(baseObj, objExpression) {
            let parentObjExpression = this.getParentObjectExp(objExpression);
            return this.expression(baseObj, parentObjExpression);
        }
    }
    class Scope {
        constructor(appName, scopeName) {
            this.$app = appName;
            this.$name = scopeName;
            this.$hidden = {};
            this.$togglers = {};
            this.$deps = [];
            this.$switchers = {};
            this.$patchables = {};
            this.$renderables = {};
            this.$pagination = {};
            this.$templates = {};
            this.$services = new Services(scopeName);
        }
        invokePreset(presets) {

            let regex = /^[a-zA-Z0-9]*$/;

            for (var i = 0; i < presets.length; i++) {
                let preset = presets[i];
                if (!regex.test(preset)) {
                    if (strawberry.debug) {
                        console.warn('strawberry.js: Unable to satisfy presets for scope: ' + this.$name + 'invalid preset names');
                    }
                }
                if (strawberry.$factory.hasOwnProperty(preset)) {
                    this.$deps.push(preset);
                    this[preset] = strawberry.$factory[preset];
                }
            }

        }
    }
    /*
    ==========================================
    Strawberry JS
    Created by Ken Terrado, 2021
    ==========================================
    */

    var strawberry = window.strawberry = {};

    // Debugging option, allows Strawberry.js to print errors during execution
    strawberry.debug = false;
    strawberry.debugger = () => {
        strawberry.debug = true;
        return strawberry;
    }

    strawberry.$factory = {};
    strawberry.$service = {};

    // Core methods of Strawberry.js
    strawberry.$$core = {
        $getScope: (scopeName) => {
            return document.querySelectorAll('[xscope="' + scopeName + '"]');
        },
        $getAllScopes: () => {
            return document.querySelectorAll('[xscope]');
        },
        $getElementsFrom: (scopeElement, attr) => {
            return scopeElement.querySelectorAll('[' + attr + ']');
        },
        $getElementsFromScope: (scopeName, attr) => {
            return document.querySelector('[xscope="' + scopeName + '"]').querySelectorAll('[' + attr + ']');
        },
        $getXValue: (element, attr) => {
            return element.getAttribute(attr);
        },
        $resolver: new Resolver
    }

    // Creates a new Strawberry instance
    strawberry.create = (e, fn) => {
        strawberry.$app = e;
        window[e] = {
            $app: e,
            $scopes: {},
            $services: {},
            // Saves an object to the strawberry object
            factory: (objName, func) => {

                if (func instanceof Function) {
                    let injector = new Injector(func);
                    let args = injector.scope(strawberry.$factory).resolve();
                    strawberry.$factory[objName] = func(...args);
                    return strawberry;
                }

                strawberry.$factory[objName] = func();
                return strawberry;

            },
            service: (serviceName, func) => {
                if (!func instanceof Function) {
                    return;
                }
                strawberry.$service[serviceName] = func;
                return strawberry;
            },
            scope: (scopeName, arg1, arg2) => {
                try {

                    // Registers a new scope
                    window[e].$scopes[scopeName] = new Scope(e, scopeName);

                    let callback = null;

                    /** Decides what argument should be executed as callback function
                        By checking if the second argument was passed a preset **/
                    if (arg1 instanceof Function) callback = arg1;
                    if (arg1 instanceof Array) callback = arg2;

                    // Checkpoint
                    if (null === callback) {
                        throw 'strawberry.js: Invalid $scope creation: ' + scopeName + ', requires callback function or preset parameters.'
                    }

                    /** If the second argument is a scope preset, inject presets into
                        into the scope object **/
                    if (callback === arg2) {
                        window[e].$scopes[scopeName].invokePreset(arg1);
                    }

                    let injector = new Injector(callback);
                    let args = injector.scope(window[e].$scopes[scopeName]).resolve();

                    // Registering injected dependency
                    window[e].$scopes[scopeName].$deps.push(...injector.getResolvedArgs());

                    // Calls the callback function required when creating a scope
                    callback(...args);

                } catch (e) {
                    console.error(e);
                }
            }
        }
        if (fn !== undefined) {
            if (fn instanceof Function) {
                fn(window[e]);
            }
        }
        return strawberry;
    }

    // Boot Strawberry.js
    DomReady.ready(() => {

        let app = window[strawberry.$app];

        // Looping through all scope elements in the document object
        let scopeElements = strawberry.$$core.$getAllScopes();

        for (var i = 0; i < scopeElements.length; i++) {

            // Retrieving the scope element and the scope name
            let scopeElement = scopeElements[i];
            let scopeName = strawberry.$$core.$getXValue(scopeElement, 'xscope');

            // Making sure that the scope element has corresponding scope object
            if (!app.$scopes.hasOwnProperty(scopeName)) continue;

            // Retreiving scope object
            let scopeObj = app.$scopes[scopeName];

            // Calls the render method of the scope services
            app.$scopes[scopeName].$services.$render(scopeObj, scopeElement);

        }

    });
})();
