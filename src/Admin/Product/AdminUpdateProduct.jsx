import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import HeroSection from "../../Components/HeroSection";

import formValidators from "../../Components/Validators/formValidators";
import imageValidators from "../../Components/Validators/imageValidators";

import {
  updateProduct,
  getProduct,
} from "../../Redux/ActionCreators/ProductActionCreators";
import { getMaincategory } from "../../Redux/ActionCreators/MaincategoryActionCreators";
import { getSubcategory } from "../../Redux/ActionCreators/SubcategoryActionCreators";
import { getBrand } from "../../Redux/ActionCreators/BrandActionCreators";

var rte;
export default function AdminupdateProduct() {
  let { id } = useParams();
  let refdiv = useRef(null);
  let [data, setData] = useState({
    name: "",
    maincategory: "",
    subcategory: "",
    brand: "",
    color: "",
    size: "",
    basePrice: "",
    discount: "",
    finalPrice: "",
    stock: true,
    description: "",
    stockQuantity: "",
    active: true,
    pic: [],
  });
  let [newFiles, setNewFiles] = useState([]);
  let [errorMessage, setErrorMessage] = useState({
    name: "",
    color: "",
    size: "",
    basePrice: "",
    discount: "",
    stockQuantity: "",
    pic: "",
  });
  let [show, setShow] = useState(false);
  let [flag, setFlag] = useState(false);
  let navigate = useNavigate();

  let dispatch = useDispatch();

  let ProductStateData = useSelector((state) => state.ProductStateData);
  let MaincategoryStateData = useSelector(
    (state) => state.MaincategoryStateData
  );
  let SubcategoryStateData = useSelector((state) => state.SubcategoryStateData);
  let BrandStateData = useSelector((state) => state.BrandStateData);

  function getInputData(e) {
    let name = e.target.name;
    let value = e.target.files ? e.target.files : e.target.value;

    if (name === "pic") {
      setNewFiles(Array.from(e.target.files));
    }

    if (name !== "active") {
      setErrorMessage((old) => {
        return {
          ...old,
          [name]: e.target.files ? imageValidators(e) : formValidators(e),
        };
      });
    }
    setData((old) => ({
      ...old,
      [name]: name === "active" || name === "stock" ? value === "1" : value,
    }));
  }

  const postData = (e) => {
    e.preventDefault();
    const error = Object.values(errorMessage).find((x) => x !== "");
    if (error) return setShow(true);

    const stockQuantity = parseInt(data.stockQuantity);
    const bp = parseInt(data.basePrice);
    const discount = parseInt(data.discount);
    const fp = parseInt(bp - (bp * discount) / 100);

    const formData = new FormData();
    formData.append(
      "data",
      new Blob(
        [
          JSON.stringify({
            name: data.name,
            maincategory: data.maincategory,
            subcategory: data.subcategory,
            brand: data.brand,
            color: data.color,
            size: data.size,
            basePrice: bp,
            discount: discount,
            finalPrice: fp,
            stock: data.stock,
            stockQuantity: stockQuantity,
            description: rte.getHTMLCode(),
            active: data.active,
            pics: data.pic,
          }),
        ],
        { type: "application/json" }
      )
    );

    newFiles.forEach((file) => {
      formData.append("pic", file);
    });

    dispatch(updateProduct({ id, formData }));
    navigate("/admin/product");
  };

  useEffect(() => {
    dispatch(getMaincategory());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getSubcategory());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getBrand());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getProduct());
    rte = new window.RichTextEditor(refdiv.current);
  }, [dispatch]);

  useEffect(() => {
      if (ProductStateData.length) {
        const item = ProductStateData.find((x) => x.id === id);
        if (item) {
          rte.setHTMLCode(item.description);
          setData({
            ...item,
            pic: Array.isArray(item.pic)
              ? item.pic
              : typeof item.pic === "string"
              ? [item.pic]
              : [],
          });
        }
      }
    }, [ProductStateData, id]);
  return (
    <>
      <HeroSection title="Admin" />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3">
            <Sidebar />
          </div>
          <div className="col-md-9">
            <h5 className="bg-primary text-center text-light p-2">
              Update Product{" "}
              <Link to="/admin/product">
                {" "}
                <i className="fa fa-backward text-light float-end"></i>
              </Link>
            </h5>

            {/* Image Preview Section */}
                        <div className="mb-3">
                          <label>Existing Images</label>
                          <br />
                          {Array.isArray(data.pic) &&
                            data.pic.map((item, index) => (
                              <img
                                key={index}
                                onClick={() => {
                                  const updatedPics = [...data.pic];
                                  updatedPics.splice(index, 1);
                                  setData((prev) => ({ ...prev, pic: updatedPics }));
                                  setFlag(!flag);
                                }}
                                src={`${process.env.REACT_APP_SERVER}${item}`}
                                height={50}
                                width={50}
                                className="mx-1"
                                alt={`product-pic-${index}`}
                              />
                            ))}
                        </div>

            <form onSubmit={postData}>
              <div className="mb-3">
                <label>Name*</label>
                <input
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={getInputData}
                  className={`form-control border-3 ${
                    show && errorMessage.name
                      ? "border-danger"
                      : "border-primary"
                  }`}
                  placeholder="Product Name"
                />
                {show && errorMessage.name ? (
                  <p className="text-danger text-capitalize">
                    {errorMessage.name}
                  </p>
                ) : null}
              </div>

              <div className="row">
                <div className="col-md-3 col-sm-6 mb-3">
                  <label>Maincategory*</label>
                  <select
                    name="maincategory"
                    value={data.maincategory}
                    onChange={getInputData}
                    className="form-select border-3 border-primary"
                  >
                    {MaincategoryStateData &&
                      MaincategoryStateData.filter((x) => x.active).map(
                        (item) => {
                          return <option key={item.id}>{item.name}</option>;
                        }
                      )}
                  </select>
                </div>

                <div className="col-md-3 col-sm-6 mb-3">
                  <label>Subcategory*</label>
                  <select
                    name="subcategory"
                    value={data.subcategory}
                    onChange={getInputData}
                    className="form-select border-3 border-primary"
                  >
                    {SubcategoryStateData &&
                      SubcategoryStateData.filter((x) => x.active).map(
                        (item) => {
                          return <option key={item.id}>{item.name}</option>;
                        }
                      )}
                  </select>
                </div>

                <div className="col-md-3 col-sm-6 mb-3">
                  <label>Brand*</label>
                  <select
                    name="brand"
                    value={data.brand}
                    onChange={getInputData}
                    className="form-select border-3 border-primary"
                  >
                    {BrandStateData &&
                      BrandStateData.filter((x) => x.active).map((item) => {
                        return <option key={item.id}>{item.name}</option>;
                      })}
                  </select>
                </div>

                <div className="col-md-3 col-sm-6 mb-3">
                  <label>Stock*</label>
                  <select
                    name="stock"
                    value={data.stock ? "1" : "0"}
                    onChange={getInputData}
                    className="form-select border-3 border-primary"
                  >
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Color*</label>
                  <input
                    type="text"
                    name="color"
                    value={data.color}
                    onChange={getInputData}
                    className={`form-control border-3 ${
                      show && errorMessage.color
                        ? "border-danger"
                        : "border-primary"
                    }`}
                    placeholder="Product Color"
                  />
                  {show && errorMessage.color ? (
                    <p className="text-danger text-capitalize">
                      {errorMessage.color}
                    </p>
                  ) : null}
                </div>

                <div className="col-md-6 mb-3">
                  <label>Size*</label>
                  <input
                    type="text"
                    name="size"
                    value={data.size}
                    onChange={getInputData}
                    className={`form-control border-3 ${
                      show && errorMessage.size
                        ? "border-danger"
                        : "border-primary"
                    }`}
                    placeholder="Product Size"
                  />
                  {show && errorMessage.size ? (
                    <p className="text-danger text-capitalize">
                      {errorMessage.size}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Base Price*</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={data.basePrice}
                    onChange={getInputData}
                    className={`form-control border-3 ${
                      show && errorMessage.basePrice
                        ? "border-danger"
                        : "border-primary"
                    }`}
                    placeholder="Product Base Price"
                  />
                  {show && errorMessage.basePrice ? (
                    <p className="text-danger text-capitalize">
                      {errorMessage.basePrice}
                    </p>
                  ) : null}
                </div>

                <div className="col-md-6 mb-3">
                  <label>Discount*</label>
                  <input
                    type="number"
                    name="discount"
                    value={data.discount}
                    onChange={getInputData}
                    className={`form-control border-3 ${
                      show && errorMessage.discount
                        ? "border-danger"
                        : "border-primary"
                    }`}
                    placeholder="Product Discount"
                  />
                  {show && errorMessage.discount ? (
                    <p className="text-danger text-capitalize">
                      {errorMessage.discount}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mb-3">
                <label>Description</label>
                <div ref={refdiv}></div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Stock Quantity*</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={data.stockQuantity}
                    onChange={getInputData}
                    className={`form-control border-3 ${
                      show && errorMessage.stockQuantity
                        ? "border-danger"
                        : "border-primary"
                    }`}
                    placeholder="Product Stock Quantity"
                  />
                  {show && errorMessage.stockQuantity ? (
                    <p className="text-danger text-capitalize">
                      {errorMessage.stockQuantity}
                    </p>
                  ) : null}
                </div>

                <div className="col-md-6 mb-3">
                  <label>Pic*</label>
                  <input
                    type="file"
                    name="pic"
                    multiple
                    onChange={getInputData}
                    className={`form-control border-3 ${
                      show && errorMessage.pic
                        ? "border-danger"
                        : "border-primary"
                    }`}
                    placeholder="Product Name"
                  />
                  {show && errorMessage.pic ? (
                    typeof errorMessage.pic === "string" ? (
                      <p className="text-danger text-capitalize">
                        {errorMessage.pic}
                      </p>
                    ) : (
                      errorMessage.pic.map((item, index) => (
                        <p className="text-danger text-capitalize" key={index}>
                          {item}
                        </p>
                      ))
                    )
                  ) : null}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Active*</label>
                  <select
                    name="active"
                    value={data.active ? "1" : "0"}
                    onChange={getInputData}
                    className="form-select border-3 border-primary"
                  >
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label>Click on Image to Remove</label>
                  <br />
                  {data.pic?.map((item, index) => {
                    return (
                      <img
                        key={index}
                        onClick={() => {
                          data.pic.splice(index, 1);
                          setFlag(!flag);
                        }}
                        src={`${process.env.REACT_APP_SERVER}${item}`}
                        height={50}
                        width={50}
                        className="mx-1"
                      ></img>
                    );
                  })}
                </div>
              </div>

              <div className="mb-3">
                <button type="submit" className="btn btn-primary w-100">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
