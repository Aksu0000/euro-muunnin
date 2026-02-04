import { StyleSheet, Text, View, TextInput, Button, ActivityIndicator, Alert } from "react-native";
import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export default function App() {
  const [rates, setRates] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [convertedCurrency, setConvertedCurrency] = useState(null);
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await fetch(
        "https://api.apilayer.com/exchangerates_data/latest?base=EUR",
        {
          headers: {
            apikey: API_KEY
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.rates) {
        throw new Error("API did not return rates");
      }
      
      setRates(data.rates);

      const currencyList = Object.keys(data.rates);
      setCurrencies(currencyList);
      setSelectedCurrency(currencyList[0]);
      setLoading(false);
    } catch (error) {
      console.error("Virhe haettaessa valuuttakursseja:", error);
    }
  };

  const convertToEuro = () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert("Insert a valid sum");
      return;
    }

    const rate = rates[selectedCurrency];
    const euroAmount = numericAmount / rate;

    setResult(euroAmount.toFixed(2));
    setConvertedAmount(numericAmount);
    setConvertedCurrency(selectedCurrency);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.title}>Fetching exhangerates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Valuuttamuunnin</Text>

      {result && convertedAmount && convertedCurrency && (
        <Text style={styles.result}>
          {convertedAmount} {convertedCurrency} = {result} €
        </Text>
      )}
      <View style={styles.row}>
      <TextInput
        style={[styles.input, { flex: 1 }]}
        placeholder="Input sum"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Picker
        selectedValue={selectedCurrency}
        onValueChange={(itemValue) => setSelectedCurrency(itemValue)}
        style={[styles.picker, { flex: 1 }]}
      >
        {currencies.map((currency) => (
          <Picker.Item key={currency} label={currency} value={currency} />
        ))}
      </Picker>
      </View>
      <Button title="Convert" onPress={convertToEuro} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  picker: {
    marginTop: -5,
    marginBottom: 0
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: -3,
    marginBottom: 0,
    borderRadius: 5,
    height: 45,
    textAlignVertical: "center",
    textAlign: "center",
    fontSize: 20,
  },
  result: {
    marginTop: 5,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold"
  }
});