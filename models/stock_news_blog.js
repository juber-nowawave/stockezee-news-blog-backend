export default (sequelize, DataTypes) => {
  const stockNewsBlog = sequelize.define(
    "stockNewsBlog",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ai_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meta_title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ai_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ai_generated: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      news_image: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ai_image: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      source: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIME"),
      },
      created_at: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_DATE"),
      },
    },
    {
      tableName: "stock_news_blog",
      underscored: true,
      timestamps: false,
    }
  );

  // stockNewsBlog.sync({ alter: true });
  return stockNewsBlog;
};
