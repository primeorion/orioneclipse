"use strict";

exports.PreferenceInput = {
    levelName : 'portfolio',
    recordId  : 1,

    parentPreferenceData : {
        level: 'model',
        id: 1,
        defaultPreferences: [
          {
            preferenceId: 14,
            valueType: 'number',
            componentType: 'default',
            componentName: 'Textbox',
            selectedOptions: [],
            value: 1
        }
       ]
    },
    updatePreferenceData:[{
            level: 'Portfolio',
            id: 1,
            defaultPreferences: [
            {
                preferenceId: 14,
                valueType: 'number',
                componentType: 'default',
                componentName: 'Textbox',
                selectedOptions: [],
                value: 2
            }]
        
        },
        {
            level: 'Team',
            id: 1,
            defaultPreferences: [
            {
                preferenceId: 13,
                valueType: 'number',
                componentType: 'default',
                componentName: 'Textbox',
                selectedOptions: [],
                value: 6
            }]
       }
    ]
}