'use strict';

//  START include for EVERY MIGRATION for Render deployment
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
//  END include for EVERY MIGRATION for Render deployment

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SpotImages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spotId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Spots',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      preview: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options); //include for EVERY MIGRATION for Render deployment

    // //query optimization
    // await queryInterface.addIndex('SpotImages', ['spotId']);
    
    // //preview images
    // await queryInterface.addIndex('SpotImages', ['spotId', 'preview']);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "SpotImages";
    await queryInterface.dropTable(options);
  }
};