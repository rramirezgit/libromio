'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "Admin", deps: []
 * createTable "Config", deps: []
 * createTable "KeyValueStore", deps: []
 * createTable "EmailQueue", deps: []
 * createTable "AttrKey", deps: []
 * createTable "Brand", deps: []
 * createTable "Collection", deps: []
 * createTable "Tag", deps: []
 * createTable "Country", deps: []
 * createTable "StandardCarrierRate", deps: []
 * createTable "Zone", deps: []
 * createTable "User", deps: []
 * createTable "AttrVal", deps: [AttrKey]
 * createTable "Category", deps: [Category]
 * createTable "Product", deps: [Brand, Category]
 * createTable "PriceConfig", deps: [PriceConfig]
 * createTable "PriceConfigDiscount", deps: [PriceConfig, Collection]
 * createTable "CollectionHasProduct", deps: [Collection, Product]
 * createTable "ProductHasAttr", deps: [Product, AttrVal]
 * createTable "ProductHasCategory", deps: [Product, Category]
 * createTable "ProductHasTag", deps: [Product, Tag]
 * createTable "ProductImage", deps: [Product]
 * createTable "ProductInfo", deps: [Product]
 * createTable "ProductVariant", deps: [Product]
 * createTable "ProductVariantAttr", deps: [ProductVariant, AttrVal]
 * createTable "ProductVariantPrice", deps: [ProductVariant, PriceConfig, PriceConfigDiscount]
 * createTable "ProductVariantStock", deps: [ProductVariant]
 * createTable "State", deps: [Country]
 * createTable "DiscountConfig", deps: [Collection]
 * createTable "DiscountCoupon", deps: [DiscountConfig]
 * createTable "Invoice", deps: [User]
 * createTable "Order", deps: [User, Invoice]
 * createTable "OrderBuyer", deps: [Order]
 * createTable "OrderDelivery", deps: [Order]
 * createTable "OrderDiscount", deps: [Order, DiscountConfig]
 * createTable "OrderItem", deps: [Order]
 * createTable "OrderPayment", deps: [Order]
 * createTable "ShippingRateConfig", deps: [Zone]
 * createTable "Zipcode", deps: [State]
 * createTable "Address", deps: [User, Zipcode]
 * createTable "UserWishlistProduct", deps: [Product, User]
 *
 **/

var info = {
    "revision": 1,
    "name": "noname",
    "created": "2021-08-20T14:16:32.658Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "Admin",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "username": {
                    "type": Sequelize.STRING,
                    "field": "username",
                    "allowNull": false,
                    "unique": true
                },
                "email": {
                    "type": Sequelize.STRING,
                    "field": "email",
                    "allowNull": false,
                    "unique": true
                },
                "firstname": {
                    "type": Sequelize.STRING,
                    "field": "firstname",
                    "allowNull": false
                },
                "lastname": {
                    "type": Sequelize.STRING,
                    "field": "lastname",
                    "allowNull": false
                },
                "password": {
                    "type": Sequelize.STRING,
                    "field": "password",
                    "allowNull": false
                },
                "permissions": {
                    "type": Sequelize.STRING,
                    "field": "permissions",
                    "allowNull": false
                },
                "lastLoginAt": {
                    "type": Sequelize.DATE,
                    "field": "lastLoginAt",
                    "allowNull": true
                },
                "tokenExpiresAt": {
                    "type": Sequelize.DATE,
                    "field": "tokenExpiresAt",
                    "allowNull": true
                },
                "token": {
                    "type": Sequelize.STRING,
                    "field": "token",
                    "allowNull": true
                },
                "remember": {
                    "type": Sequelize.BOOLEAN,
                    "field": "remember",
                    "allowNull": false,
                    "defaultValue": false
                },
                "updatedBy": {
                    "type": Sequelize.STRING,
                    "field": "updatedBy",
                    "allowNull": false
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                },
                "deletedAt": {
                    "type": Sequelize.DATE,
                    "field": "deletedAt"
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Config",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "keyname": {
                    "type": Sequelize.STRING,
                    "field": "keyname",
                    "allowNull": false
                },
                "fromDate": {
                    "type": Sequelize.DATEONLY,
                    "field": "fromDate",
                    "allowNull": true
                },
                "toDate": {
                    "type": Sequelize.DATEONLY,
                    "field": "toDate",
                    "allowNull": true
                },
                "data": {
                    "type": Sequelize.TEXT,
                    "field": "data",
                    "allowNull": false
                },
                "updatedBy": {
                    "type": Sequelize.STRING,
                    "field": "updatedBy",
                    "allowNull": false
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "KeyValueStore",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "k": {
                    "type": Sequelize.STRING,
                    "field": "k",
                    "allowNull": false
                },
                "v": {
                    "type": Sequelize.TEXT,
                    "field": "v",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "EmailQueue",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "transportKey": {
                    "type": Sequelize.STRING,
                    "field": "transportKey",
                    "allowNull": false
                },
                "message": {
                    "type": Sequelize.TEXT,
                    "field": "message",
                    "allowNull": false
                },
                "error": {
                    "type": Sequelize.TEXT,
                    "field": "error",
                    "allowNull": true
                },
                "attempt": {
                    "type": Sequelize.INTEGER.UNSIGNED,
                    "field": "attempt",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "consumeAt": {
                    "type": Sequelize.DATE,
                    "field": "consumeAt",
                    "allowNull": false
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "AttrKey",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "k": {
                    "type": Sequelize.STRING,
                    "field": "k",
                    "allowNull": false
                },
                "urlK": {
                    "type": Sequelize.STRING,
                    "field": "urlK",
                    "allowNull": false
                },
                "shopFilter": {
                    "type": Sequelize.BOOLEAN,
                    "field": "shopFilter",
                    "allowNull": false,
                    "defaultValue": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Brand",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name",
                    "allowNull": false
                },
                "urlName": {
                    "type": Sequelize.STRING,
                    "field": "urlName",
                    "allowNull": false
                },
                "logo": {
                    "type": Sequelize.STRING,
                    "field": "logo",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Collection",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "keyname": {
                    "type": Sequelize.STRING(50),
                    "field": "keyname",
                    "allowNull": false
                },
                "filters": {
                    "type": Sequelize.TEXT,
                    "field": "filters",
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Tag",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name",
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Country",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name",
                    "allowNull": false
                },
                "isoName": {
                    "type": Sequelize.STRING(2),
                    "field": "isoName",
                    "allowNull": false
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "StandardCarrierRate",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "rateKey": {
                    "type": Sequelize.STRING,
                    "field": "rateKey",
                    "allowNull": false
                },
                "rateName": {
                    "type": Sequelize.STRING,
                    "field": "rateName",
                    "allowNull": false
                },
                "maxSize": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "maxSize",
                    "allowNull": true
                },
                "maxWeight": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "maxWeight",
                    "allowNull": true
                },
                "costPerSize": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "costPerSize",
                    "allowNull": true
                },
                "costPerWeight": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "costPerWeight",
                    "allowNull": true
                },
                "baseCost": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "baseCost",
                    "allowNull": true
                },
                "fixedCost": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "fixedCost",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Zone",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name",
                    "allowNull": false
                },
                "zipcodesIds": {
                    "type": Sequelize.TEXT,
                    "field": "zipcodesIds",
                    "allowNull": true
                },
                "statesIds": {
                    "type": Sequelize.TEXT,
                    "field": "statesIds",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "User",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "accountEmail": {
                    "type": Sequelize.STRING,
                    "field": "accountEmail",
                    "allowNull": false,
                    "unique": true
                },
                "contactEmail": {
                    "type": Sequelize.STRING,
                    "field": "contactEmail",
                    "allowNull": false
                },
                "firstname": {
                    "type": Sequelize.STRING,
                    "field": "firstname",
                    "allowNull": true
                },
                "lastname": {
                    "type": Sequelize.STRING,
                    "field": "lastname",
                    "allowNull": true
                },
                "password": {
                    "type": Sequelize.STRING,
                    "field": "password",
                    "allowNull": true
                },
                "phonePrefix": {
                    "type": Sequelize.STRING(10),
                    "field": "phonePrefix",
                    "allowNull": true
                },
                "phoneNumber": {
                    "type": Sequelize.STRING(20),
                    "field": "phoneNumber",
                    "allowNull": true
                },
                "googleId": {
                    "type": Sequelize.STRING,
                    "field": "googleId",
                    "allowNull": true
                },
                "facebookId": {
                    "type": Sequelize.STRING,
                    "field": "facebookId",
                    "allowNull": true
                },
                "addresses": {
                    "type": Sequelize.TEXT,
                    "field": "addresses",
                    "allowNull": true
                },
                "blacklisted": {
                    "type": Sequelize.BOOLEAN,
                    "field": "blacklisted",
                    "allowNull": false,
                    "defaultValue": false
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                },
                "deletedAt": {
                    "type": Sequelize.DATE,
                    "field": "deletedAt"
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "AttrVal",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "v": {
                    "type": Sequelize.STRING,
                    "field": "v",
                    "allowNull": false
                },
                "urlV": {
                    "type": Sequelize.STRING,
                    "field": "urlV",
                    "allowNull": false
                },
                "attrKeyId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "attrKeyId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "RESTRICT",
                    "references": {
                        "model": "AttrKey",
                        "key": "id"
                    },
                    "name": "attrKeyId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Category",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name",
                    "allowNull": false
                },
                "urlName": {
                    "type": Sequelize.STRING,
                    "field": "urlName",
                    "allowNull": false
                },
                "fullUrlName": {
                    "type": Sequelize.STRING,
                    "field": "fullUrlName",
                    "allowNull": false
                },
                "pos": {
                    "type": Sequelize.INTEGER.UNSIGNED,
                    "field": "pos",
                    "allowNull": false
                },
                "menuPos": {
                    "type": Sequelize.INTEGER.UNSIGNED,
                    "field": "menuPos",
                    "allowNull": true
                },
                "hasProducts": {
                    "type": Sequelize.BOOLEAN,
                    "field": "hasProducts",
                    "allowNull": false,
                    "defaultValue": false
                },
                "defaultAttrs": {
                    "type": Sequelize.TEXT,
                    "field": "defaultAttrs",
                    "allowNull": true
                },
                "parentId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "parentId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Category",
                        "key": "id"
                    },
                    "name": "parentId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Product",
            {
                "id": {
                    "type": Sequelize.UUID,
                    "field": "id",
                    "allowNull": false,
                    "defaultValue": Sequelize.UUIDV4,
                    "primaryKey": true
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name",
                    "allowNull": false
                },
                "urlName": {
                    "type": Sequelize.STRING,
                    "field": "urlName",
                    "allowNull": false
                },
                "keywords": {
                    "type": Sequelize.TEXT,
                    "field": "keywords",
                    "allowNull": false,
                    "defaultValue": ""
                },
                "complete": {
                    "type": Sequelize.BOOLEAN,
                    "field": "complete",
                    "allowNull": false,
                    "defaultValue": false
                },
                "active": {
                    "type": Sequelize.BOOLEAN,
                    "field": "active",
                    "allowNull": false,
                    "defaultValue": true
                },
                "activeFrom": {
                    "type": Sequelize.DATEONLY,
                    "field": "activeFrom",
                    "allowNull": true
                },
                "shopable": {
                    "type": Sequelize.BOOLEAN,
                    "field": "shopable",
                    "allowNull": false,
                    "defaultValue": false
                },
                "buyable": {
                    "type": Sequelize.BOOLEAN,
                    "field": "buyable",
                    "allowNull": false,
                    "defaultValue": false
                },
                "hasUniqueVariant": {
                    "type": Sequelize.BOOLEAN,
                    "field": "hasUniqueVariant",
                    "allowNull": false,
                    "defaultValue": true
                },
                "priceMetric": {
                    "type": Sequelize.STRING,
                    "field": "priceMetric",
                    "allowNull": true
                },
                "unitMetric": {
                    "type": Sequelize.STRING,
                    "field": "unitMetric",
                    "allowNull": false
                },
                "updatedBy": {
                    "type": Sequelize.STRING,
                    "field": "updatedBy",
                    "allowNull": true
                },
                "vAttrsPos": {
                    "type": Sequelize.STRING,
                    "field": "vAttrsPos",
                    "allowNull": true
                },
                "relevance": {
                    "type": Sequelize.INTEGER,
                    "field": "relevance",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                },
                "deletedAt": {
                    "type": Sequelize.DATE,
                    "field": "deletedAt"
                },
                "brandId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "brandId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "Brand",
                        "key": "id"
                    },
                    "name": "brandId",
                    "allowNull": true
                },
                "categoryId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "categoryId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "Category",
                        "key": "id"
                    },
                    "name": "categoryId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "PriceConfig",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "keyname": {
                    "type": Sequelize.STRING,
                    "field": "keyname",
                    "allowNull": false
                },
                "relativePct": {
                    "type": Sequelize.DECIMAL(10, 2),
                    "field": "relativePct",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "relativeToId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "relativeToId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "PriceConfig",
                        "key": "id"
                    },
                    "name": "relativeToId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "PriceConfigDiscount",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "displayName": {
                    "type": Sequelize.STRING,
                    "field": "displayName",
                    "allowNull": false
                },
                "discountPct": {
                    "type": Sequelize.INTEGER,
                    "field": "discountPct",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "priority": {
                    "type": Sequelize.INTEGER.UNSIGNED,
                    "field": "priority",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "priceConfigId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "priceConfigId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "PriceConfig",
                        "key": "id"
                    },
                    "name": "priceConfigId",
                    "allowNull": true
                },
                "collectionId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "collectionId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Collection",
                        "key": "id"
                    },
                    "name": "collectionId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "CollectionHasProduct",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "collectionId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "collectionId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Collection",
                        "key": "id"
                    },
                    "unique": "CollectionHasProduct_productId_collectionId_unique",
                    "name": "collectionId"
                },
                "productId": {
                    "type": Sequelize.UUID,
                    "field": "productId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Product",
                        "key": "id"
                    },
                    "unique": "CollectionHasProduct_productId_collectionId_unique",
                    "name": "productId"
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "ProductHasAttr",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "productId": {
                    "type": Sequelize.UUID,
                    "field": "productId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Product",
                        "key": "id"
                    },
                    "unique": "ProductHasAttr_productId_attrValId_unique",
                    "name": "productId"
                },
                "attrValId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "attrValId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "AttrVal",
                        "key": "id"
                    },
                    "unique": "ProductHasAttr_productId_attrValId_unique",
                    "name": "attrValId"
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "ProductHasCategory",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "productId": {
                    "type": Sequelize.UUID,
                    "field": "productId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Product",
                        "key": "id"
                    },
                    "unique": "ProductHasCategory_productId_categoryId_unique",
                    "name": "productId"
                },
                "categoryId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "categoryId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Category",
                        "key": "id"
                    },
                    "unique": "ProductHasCategory_productId_categoryId_unique",
                    "name": "categoryId"
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "ProductHasTag",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "productId": {
                    "type": Sequelize.UUID,
                    "field": "productId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Product",
                        "key": "id"
                    },
                    "unique": "ProductHasTag_productId_tagId_unique",
                    "name": "productId"
                },
                "tagId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "tagId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Tag",
                        "key": "id"
                    },
                    "unique": "ProductHasTag_productId_tagId_unique",
                    "name": "tagId"
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "ProductImage",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "img": {
                    "type": Sequelize.STRING,
                    "field": "img",
                    "allowNull": false
                },
                "pos": {
                    "type": Sequelize.INTEGER,
                    "field": "pos",
                    "allowNull": false
                },
                "productId": {
                    "type": Sequelize.UUID,
                    "field": "productId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Product",
                        "key": "id"
                    },
                    "name": "productId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "ProductInfo",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "description": {
                    "type": Sequelize.TEXT,
                    "field": "description",
                    "allowNull": true
                },
                "productId": {
                    "type": Sequelize.UUID,
                    "field": "productId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Product",
                        "key": "id"
                    },
                    "name": "productId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "ProductVariant",
            {
                "id": {
                    "type": Sequelize.UUID,
                    "field": "id",
                    "allowNull": false,
                    "defaultValue": Sequelize.UUIDV4,
                    "primaryKey": true
                },
                "sku": {
                    "type": Sequelize.STRING,
                    "field": "sku",
                    "allowNull": false
                },
                "ean": {
                    "type": Sequelize.STRING,
                    "field": "ean",
                    "allowNull": true
                },
                "size": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "size",
                    "allowNull": false
                },
                "weight": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "weight",
                    "allowNull": false
                },
                "metricFactor": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "metricFactor",
                    "allowNull": false,
                    "defaultValue": 1
                },
                "type": {
                    "type": Sequelize.STRING,
                    "field": "type",
                    "allowNull": false,
                    "defaultValue": "physical"
                },
                "digital": {
                    "type": Sequelize.TEXT,
                    "field": "digital",
                    "allowNull": true
                },
                "main": {
                    "type": Sequelize.BOOLEAN,
                    "field": "main",
                    "allowNull": false,
                    "defaultValue": false
                },
                "position": {
                    "type": Sequelize.INTEGER,
                    "field": "position",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                },
                "productId": {
                    "type": Sequelize.UUID,
                    "field": "productId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Product",
                        "key": "id"
                    },
                    "name": "productId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "ProductVariantAttr",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "productVariantId": {
                    "type": Sequelize.UUID,
                    "field": "productVariantId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "ProductVariant",
                        "key": "id"
                    },
                    "unique": "ProductVariantAttr_productVariantId_attrValId_unique",
                    "name": "productVariantId"
                },
                "attrValId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "attrValId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "AttrVal",
                        "key": "id"
                    },
                    "unique": "ProductVariantAttr_productVariantId_attrValId_unique",
                    "name": "attrValId"
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "ProductVariantPrice",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "basePrice": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "basePrice",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "modifPrice": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "modifPrice",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "configDiscountPct": {
                    "type": Sequelize.INTEGER,
                    "field": "configDiscountPct",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "extraDiscountPct": {
                    "type": Sequelize.INTEGER,
                    "field": "extraDiscountPct",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "discountPct": {
                    "type": Sequelize.INTEGER,
                    "field": "discountPct",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "prevPrice": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "prevPrice",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "price": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "price",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "productVariantId": {
                    "type": Sequelize.UUID,
                    "field": "productVariantId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "ProductVariant",
                        "key": "id"
                    },
                    "name": "productVariantId",
                    "allowNull": true
                },
                "priceConfigId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "priceConfigId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "PriceConfig",
                        "key": "id"
                    },
                    "name": "priceConfigId",
                    "allowNull": true
                },
                "priceConfigDiscountId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "priceConfigDiscountId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "PriceConfigDiscount",
                        "key": "id"
                    },
                    "name": "priceConfigDiscountId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "ProductVariantStock",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "qty": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "qty",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "deferredDelivery": {
                    "type": Sequelize.INTEGER,
                    "field": "deferredDelivery",
                    "allowNull": true
                },
                "availabilityDate": {
                    "type": Sequelize.DATEONLY,
                    "field": "availabilityDate",
                    "allowNull": true
                },
                "maxBuyableQty": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "maxBuyableQty",
                    "allowNull": true
                },
                "infiniteQty": {
                    "type": Sequelize.BOOLEAN,
                    "field": "infiniteQty",
                    "allowNull": false,
                    "defaultValue": false
                },
                "availability": {
                    "type": Sequelize.ENUM('InStock', 'OutOfStock', 'PreSale', 'PreOrder'),
                    "field": "availability",
                    "allowNull": false
                },
                "productVariantId": {
                    "type": Sequelize.UUID,
                    "field": "productVariantId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "ProductVariant",
                        "key": "id"
                    },
                    "name": "productVariantId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "State",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name",
                    "allowNull": false
                },
                "isoName": {
                    "type": Sequelize.STRING,
                    "field": "isoName",
                    "allowNull": false
                },
                "countryId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "countryId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Country",
                        "key": "id"
                    },
                    "name": "countryId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "DiscountConfig",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "keyname": {
                    "type": Sequelize.STRING,
                    "field": "keyname",
                    "allowNull": false
                },
                "itemsDiscountPct": {
                    "type": Sequelize.INTEGER.UNSIGNED,
                    "field": "itemsDiscountPct",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "itemsDiscountLimit": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "itemsDiscountLimit",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "itemsLimitMode": {
                    "type": Sequelize.STRING,
                    "field": "itemsLimitMode",
                    "allowNull": false,
                    "defaultValue": "per_unit"
                },
                "itemsCombinationMode": {
                    "type": Sequelize.STRING,
                    "field": "itemsCombinationMode",
                    "allowNull": false,
                    "defaultValue": "all"
                },
                "deliveryDiscountPct": {
                    "type": Sequelize.INTEGER.UNSIGNED,
                    "field": "deliveryDiscountPct",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "deliveryDiscountLimit": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "deliveryDiscountLimit",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "fullOrderDiscountPct": {
                    "type": Sequelize.INTEGER.UNSIGNED,
                    "field": "fullOrderDiscountPct",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "fullOrderDiscountLimit": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "fullOrderDiscountLimit",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "collectionId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "collectionId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "Collection",
                        "key": "id"
                    },
                    "name": "collectionId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "DiscountCoupon",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "code": {
                    "type": Sequelize.STRING,
                    "field": "code",
                    "allowNull": false
                },
                "consumable": {
                    "type": Sequelize.BOOLEAN,
                    "field": "consumable",
                    "allowNull": false,
                    "defaultValue": false
                },
                "dueDate": {
                    "type": Sequelize.DATEONLY,
                    "field": "dueDate",
                    "allowNull": true
                },
                "qty": {
                    "type": Sequelize.INTEGER.UNSIGNED,
                    "field": "qty",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "consumedQty": {
                    "type": Sequelize.INTEGER.UNSIGNED,
                    "field": "consumedQty",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "discountConfigId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "discountConfigId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "RESTRICT",
                    "references": {
                        "model": "DiscountConfig",
                        "key": "id"
                    },
                    "name": "discountConfigId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Invoice",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "business": {
                    "type": Sequelize.BOOLEAN,
                    "field": "business",
                    "allowNull": false
                },
                "personFirstname": {
                    "type": Sequelize.STRING,
                    "field": "personFirstname",
                    "allowNull": true
                },
                "personLastname": {
                    "type": Sequelize.STRING,
                    "field": "personLastname",
                    "allowNull": true
                },
                "personIdNumber": {
                    "type": Sequelize.STRING(10),
                    "field": "personIdNumber",
                    "allowNull": true
                },
                "businessName": {
                    "type": Sequelize.STRING,
                    "field": "businessName",
                    "allowNull": true
                },
                "businessIdNumber": {
                    "type": Sequelize.STRING(20),
                    "field": "businessIdNumber",
                    "allowNull": true
                },
                "invoiceType": {
                    "type": Sequelize.STRING(10),
                    "field": "invoiceType",
                    "allowNull": true
                },
                "userId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "userId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "RESTRICT",
                    "references": {
                        "model": "User",
                        "key": "id"
                    },
                    "name": "userId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Order",
            {
                "id": {
                    "type": Sequelize.UUID,
                    "field": "id",
                    "allowNull": false,
                    "defaultValue": Sequelize.UUIDV4,
                    "primaryKey": true
                },
                "code": {
                    "type": Sequelize.STRING,
                    "field": "code",
                    "allowNull": true
                },
                "mainStatus": {
                    "type": Sequelize.STRING,
                    "field": "mainStatus",
                    "allowNull": false
                },
                "paymentStatus": {
                    "type": Sequelize.STRING,
                    "field": "paymentStatus",
                    "allowNull": false
                },
                "makingStatus": {
                    "type": Sequelize.STRING,
                    "field": "makingStatus",
                    "allowNull": false
                },
                "deliveryStatus": {
                    "type": Sequelize.STRING,
                    "field": "deliveryStatus",
                    "allowNull": false
                },
                "readyDate": {
                    "type": Sequelize.DATEONLY,
                    "field": "readyDate",
                    "allowNull": true
                },
                "confirmedAt": {
                    "type": Sequelize.DATE,
                    "field": "confirmedAt",
                    "allowNull": true
                },
                "paidAt": {
                    "type": Sequelize.DATE,
                    "field": "paidAt",
                    "allowNull": true
                },
                "totalPaid": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "totalPaid",
                    "allowNull": false
                },
                "total": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "total",
                    "allowNull": false
                },
                "invoiceAddress": {
                    "type": Sequelize.TEXT,
                    "field": "invoiceAddress",
                    "allowNull": true
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                },
                "userId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "userId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "User",
                        "key": "id"
                    },
                    "name": "userId",
                    "allowNull": true
                },
                "invoiceId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "invoiceId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "RESTRICT",
                    "references": {
                        "model": "Invoice",
                        "key": "id"
                    },
                    "name": "invoiceId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "OrderBuyer",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "firstname": {
                    "type": Sequelize.STRING,
                    "field": "firstname",
                    "allowNull": false
                },
                "lastname": {
                    "type": Sequelize.STRING,
                    "field": "lastname",
                    "allowNull": false
                },
                "email": {
                    "type": Sequelize.STRING,
                    "field": "email",
                    "allowNull": false
                },
                "phonePrefix": {
                    "type": Sequelize.STRING(10),
                    "field": "phonePrefix",
                    "allowNull": false
                },
                "phoneNumber": {
                    "type": Sequelize.STRING(20),
                    "field": "phoneNumber",
                    "allowNull": false
                },
                "orderId": {
                    "type": Sequelize.UUID,
                    "field": "orderId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Order",
                        "key": "id"
                    },
                    "name": "orderId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "OrderDelivery",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "methodKey": {
                    "type": Sequelize.STRING,
                    "field": "methodKey",
                    "allowNull": false
                },
                "methodName": {
                    "type": Sequelize.STRING,
                    "field": "methodName",
                    "allowNull": false
                },
                "optionKey": {
                    "type": Sequelize.STRING,
                    "field": "optionKey",
                    "allowNull": true
                },
                "optionName": {
                    "type": Sequelize.STRING,
                    "field": "optionName",
                    "allowNull": true
                },
                "data": {
                    "type": Sequelize.TEXT,
                    "field": "data",
                    "allowNull": true
                },
                "cost": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "cost",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "discount": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "discount",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "discountName": {
                    "type": Sequelize.STRING,
                    "field": "discountName",
                    "allowNull": true
                },
                "total": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "total",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "status": {
                    "type": Sequelize.STRING,
                    "field": "status",
                    "allowNull": false
                },
                "zipcode": {
                    "type": Sequelize.STRING(12),
                    "field": "zipcode",
                    "allowNull": false
                },
                "externalData": {
                    "type": Sequelize.TEXT,
                    "field": "externalData",
                    "allowNull": true
                },
                "externalReference": {
                    "type": Sequelize.STRING,
                    "field": "externalReference",
                    "allowNull": true
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                },
                "orderId": {
                    "type": Sequelize.UUID,
                    "field": "orderId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Order",
                        "key": "id"
                    },
                    "name": "orderId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "OrderDiscount",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "triggerType": {
                    "type": Sequelize.STRING,
                    "field": "triggerType",
                    "allowNull": false
                },
                "triggerKey": {
                    "type": Sequelize.STRING,
                    "field": "triggerKey",
                    "allowNull": false
                },
                "discountName": {
                    "type": Sequelize.STRING,
                    "field": "discountName",
                    "allowNull": false
                },
                "itemsDiscount": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "itemsDiscount",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "deliveryDiscount": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "deliveryDiscount",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "fullOrderDiscount": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "fullOrderDiscount",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "orderId": {
                    "type": Sequelize.UUID,
                    "field": "orderId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Order",
                        "key": "id"
                    },
                    "name": "orderId",
                    "allowNull": true
                },
                "discountConfigId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "discountConfigId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "DiscountConfig",
                        "key": "id"
                    },
                    "name": "discountConfigId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "OrderItem",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "qty": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "qty",
                    "allowNull": false
                },
                "refId": {
                    "type": Sequelize.UUID,
                    "field": "refId",
                    "allowNull": false
                },
                "refType": {
                    "type": Sequelize.STRING,
                    "field": "refType",
                    "allowNull": false
                },
                "sku": {
                    "type": Sequelize.STRING,
                    "field": "sku",
                    "allowNull": false
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name",
                    "allowNull": false
                },
                "variantName": {
                    "type": Sequelize.STRING,
                    "field": "variantName",
                    "allowNull": true
                },
                "readyDate": {
                    "type": Sequelize.DATEONLY,
                    "field": "readyDate",
                    "allowNull": true
                },
                "initPrice": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "initPrice",
                    "allowNull": false
                },
                "initTotal": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "initTotal",
                    "allowNull": false
                },
                "discount": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "discount",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "discountTotal": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "discountTotal",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "discountName": {
                    "type": Sequelize.STRING,
                    "field": "discountName",
                    "allowNull": true
                },
                "discountPct": {
                    "type": Sequelize.INTEGER.UNSIGNED,
                    "field": "discountPct",
                    "allowNull": false
                },
                "reachedByOrderDiscount": {
                    "type": Sequelize.BOOLEAN,
                    "field": "reachedByOrderDiscount",
                    "allowNull": false,
                    "defaultValue": false
                },
                "orderDiscountTotal": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "orderDiscountTotal",
                    "allowNull": false,
                    "defaultValue": 0
                },
                "price": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "price",
                    "allowNull": false
                },
                "total": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "total",
                    "allowNull": false
                },
                "image": {
                    "type": Sequelize.STRING(600),
                    "field": "image",
                    "allowNull": false
                },
                "size": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "size",
                    "allowNull": false
                },
                "weight": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "weight",
                    "allowNull": false
                },
                "unitMetric": {
                    "type": Sequelize.STRING,
                    "field": "unitMetric",
                    "allowNull": false
                },
                "type": {
                    "type": Sequelize.STRING,
                    "field": "type",
                    "allowNull": false,
                    "defaultValue": "physical"
                },
                "digital": {
                    "type": Sequelize.TEXT,
                    "field": "digital",
                    "allowNull": true
                },
                "orderId": {
                    "type": Sequelize.UUID,
                    "field": "orderId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Order",
                        "key": "id"
                    },
                    "name": "orderId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "OrderPayment",
            {
                "id": {
                    "type": Sequelize.UUID,
                    "field": "id",
                    "allowNull": false,
                    "defaultValue": Sequelize.UUIDV4,
                    "primaryKey": true
                },
                "methodKey": {
                    "type": Sequelize.STRING,
                    "field": "methodKey",
                    "allowNull": false
                },
                "methodName": {
                    "type": Sequelize.STRING,
                    "field": "methodName",
                    "allowNull": false
                },
                "optionKey": {
                    "type": Sequelize.STRING,
                    "field": "optionKey",
                    "allowNull": true
                },
                "optionName": {
                    "type": Sequelize.STRING,
                    "field": "optionName",
                    "allowNull": true
                },
                "data": {
                    "type": Sequelize.TEXT,
                    "field": "data",
                    "allowNull": true
                },
                "amount": {
                    "type": Sequelize.DECIMAL(10, 2).UNSIGNED,
                    "field": "amount",
                    "allowNull": false
                },
                "status": {
                    "type": Sequelize.STRING,
                    "field": "status",
                    "allowNull": false
                },
                "paid": {
                    "type": Sequelize.BOOLEAN,
                    "field": "paid",
                    "allowNull": false
                },
                "paidAt": {
                    "type": Sequelize.DATE,
                    "field": "paidAt",
                    "allowNull": true
                },
                "refunded": {
                    "type": Sequelize.BOOLEAN,
                    "field": "refunded",
                    "allowNull": false
                },
                "refundedAt": {
                    "type": Sequelize.DATE,
                    "field": "refundedAt",
                    "allowNull": true
                },
                "externalData": {
                    "type": Sequelize.TEXT,
                    "field": "externalData",
                    "allowNull": true
                },
                "externalReference": {
                    "type": Sequelize.STRING,
                    "field": "externalReference",
                    "allowNull": true
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                },
                "orderId": {
                    "type": Sequelize.UUID,
                    "field": "orderId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Order",
                        "key": "id"
                    },
                    "name": "orderId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "ShippingRateConfig",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "carrierKey": {
                    "type": Sequelize.STRING,
                    "field": "carrierKey",
                    "allowNull": false
                },
                "rateKey": {
                    "type": Sequelize.STRING,
                    "field": "rateKey",
                    "allowNull": false
                },
                "position": {
                    "type": Sequelize.INTEGER.UNSIGNED,
                    "field": "position",
                    "allowNull": false
                },
                "zoneId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "zoneId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Zone",
                        "key": "id"
                    },
                    "name": "zoneId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Zipcode",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "code": {
                    "type": Sequelize.STRING(15),
                    "field": "code",
                    "allowNull": false
                },
                "stateId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "stateId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "State",
                        "key": "id"
                    },
                    "name": "stateId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "Address",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "title": {
                    "type": Sequelize.STRING,
                    "field": "title",
                    "allowNull": true
                },
                "street": {
                    "type": Sequelize.STRING,
                    "field": "street",
                    "allowNull": false
                },
                "streetNumber": {
                    "type": Sequelize.STRING,
                    "field": "streetNumber",
                    "allowNull": false
                },
                "apartment": {
                    "type": Sequelize.STRING,
                    "field": "apartment",
                    "allowNull": true
                },
                "floor": {
                    "type": Sequelize.STRING,
                    "field": "floor",
                    "allowNull": true
                },
                "comment": {
                    "type": Sequelize.STRING,
                    "field": "comment",
                    "allowNull": true
                },
                "intersection1": {
                    "type": Sequelize.STRING,
                    "field": "intersection1",
                    "allowNull": true
                },
                "intersection2": {
                    "type": Sequelize.STRING,
                    "field": "intersection2",
                    "allowNull": true
                },
                "city": {
                    "type": Sequelize.STRING,
                    "field": "city",
                    "allowNull": false
                },
                "userId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "userId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "User",
                        "key": "id"
                    },
                    "name": "userId",
                    "allowNull": true
                },
                "zipcodeId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "zipcodeId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Zipcode",
                        "key": "id"
                    },
                    "name": "zipcodeId",
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "UserWishlistProduct",
            {
                "id": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "id",
                    "allowNull": false,
                    "primaryKey": true,
                    "autoIncrement": true
                },
                "productId": {
                    "type": Sequelize.UUID,
                    "field": "productId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "Product",
                        "key": "id"
                    },
                    "name": "productId",
                    "allowNull": true
                },
                "userId": {
                    "type": Sequelize.BIGINT(11).UNSIGNED,
                    "field": "userId",
                    "onUpdate": "RESTRICT",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "User",
                        "key": "id"
                    },
                    "name": "userId",
                    "allowNull": true
                }
            },
            {}
        ]
    }
];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: info
};
