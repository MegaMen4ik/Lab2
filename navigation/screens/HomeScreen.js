import React, {useEffect, useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';


const initProducts = [
    {
        name: 'Notebook',
        price: 15,
        count: 213,
    },
    {
        name: 'Fridge',
        price: 250,
        count: 2,
    },
    {
        name: 'Laptop',
        price: 2000,
        count: 111,
    },
    {
        name: 'Art',
        price: 120,
        count: 4,
    },
    {
        name: 'Table',
        price: 300,
        count: 3,
    }
];

const db = openDatabase({
    name: 'storage',
});


export default function HomeScreen({navigation}) {
    const [products, setProducts] = useState([]);
    const [maxPrice, setMaxPrice] = useState([]);
    const [minPrice, setMinPrice] = useState([]);

    const createTables = () => {
        db.transaction(txn => {
            txn.executeSql(
                'CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(20), price REAL DEFAULT 0, count INTEGER DEFAULT 0);' +
                'CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(20), surname VARCHAR(20) NULL, address VARCHAR(255), email VARCHAR(255), number VARCHAR(20) NULL);',
                [],
                (sqlTxn, res) => {
                    console.log('tables created successfully');
                },
                error => {
                    console.log('error on creating table ' + error.message);
                },
            );
        });
    };

    const addProduct = (item) => {
        db.transaction(txn => {
            txn.executeSql(
                `INSERT INTO products (name, price, count) VALUES (?, ?, ?)`,
                [item.name, item.price, item.count],
                (sqlTxn) => {
                    console.log("Product added successfully")
                    getProducts();
                },
                error => {
                    console.log("error on adding product " + error.message)
                }
            )
        })
    }

    const getProducts = () => {
        db.transaction(txn => {
            txn.executeSql(
                `SELECT * from products WHERE count < 5 ORDER BY id ASC`,
                [],
                (sqlTxn, res) => {
                    console.log('successfully got')
                    let len = res.rows.length
                    if(len > 0) {
                        let results = [];
                        for (let i = 0; i < len; i++) {
                            let item = res.rows.item(i)
                            results.push({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                count: item.count,
                            })
                        }
                        setProducts(results)
                    }
                },
                error => {
                    console.log(error.message)
                }
            )
        })
    }

    const getMaxPrice = () => {
        db.transaction(txn => {
            txn.executeSql(
                `SELECT Max(price) from products WHERE count < 5`,

                [],
                (sqlTxn, res) => {
                    console.log(res)
                    let len = res.rows.length
                    if(len > 0) {
                        setMaxPrice(res.rows.item(0)['Max(price)']);
                    }
                },
                error => {
                    console.log(error.message)
                }
            )
        })
    }

    const getMinPrice = () => {
        db.transaction(txn => {
            txn.executeSql(
                `SELECT Min(price) from products WHERE count < 5`,

                [],
                (sqlTxn, res) => {
                    console.log(res)
                    let len = res.rows.length
                    if(len > 0) {
                        setMinPrice(res.rows.item(0)['Min(price)']);
                    }
                },
                error => {
                    console.log(error.message)
                }
            )
        })
    }

    const renderProduct = ({item}) => {
        return (
            <View style={{display: "flex", flexDirection: "row", padding: 20}}>
                <Text style={{flex: 2, textAlign: 'center'}}>
                    {item.name}
                </Text>
                <Text style={{flex: 1, textAlign: 'center'}}>
                    {item.count}
                </Text>
            </View>
        );
    }
    useEffect(async () => {
        createTables();
        getProducts();
        getMaxPrice();
        getMinPrice();
    }, []);
    return (
        <View>
            <FlatList data={products} renderItem={renderProduct} />
            <View style={{marginTop: 20, flexDirection: "row", display: "flex", justifyContent: "space-around"}}>
                <View>
                    <Text>Max</Text>
                    <Text style={{textAlign: "center"}}>{maxPrice}</Text>
                </View>

                <View>
                    <Text>Min</Text>
                    <Text style={{textAlign: "center"}}>{minPrice}</Text>
                </View>
                <View>
                    <Text>Sum(Min/Max)</Text>
                    <Text style={{textAlign: "center"}}>{minPrice+maxPrice}</Text>
                </View>
            </View>
        </View>

    );
}
